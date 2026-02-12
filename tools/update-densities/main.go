package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/lambda"
	"io"
	"log"
	"os"
	"strings"
	"time"
)

func MakeRequest(ctx context.Context, lambdaClient *lambda.Client, stage *string, request any) ([]byte, error) {
	requestPayload, err := json.Marshal(request)
	if err != nil {
		return nil, err
	}

	functionName := fmt.Sprintf("update-density-data-%s", *stage)

	response, err := lambdaClient.Invoke(ctx, &lambda.InvokeInput{
		FunctionName:   &functionName,
		InvocationType: "RequestResponse",
		Payload:        requestPayload,
	})
	if err != nil {
		return nil, err
	}

	if response.StatusCode == 200 {
		return response.Payload, nil
	} else {
		log.Printf("Error was: %s", string(response.Payload))
		return nil, fmt.Errorf("could not invoke lambda function: error was %d", response.StatusCode)
	}
}

func GetGenericResponse(response []byte) (*GenericResponse, error) {
	var content GenericResponse
	err := json.Unmarshal(response, &content)
	if err != nil {
		return nil, err
	} else {
		return &content, nil
	}
}

func LoadDataFile(filename *string) ([]byte, error) {
	fp, err := os.Open(*filename)
	if err != nil {
		return nil, err
	}
	defer fp.Close()

	content, err := io.ReadAll(fp)
	return content, err
}

func GetBaseUrl(stage *string) string {
	switch strings.ToUpper(*stage) {
	case "CODE":
		return "https://recipes.code.dev-guardianapis.com"
	case "PROD":
		return "https://recipes.guardianapis.com"
	default:
		log.Printf("STAGE should be CODE or PROD")
		return ""
	}
}

func main() {
	listRequest := flag.Bool("list", false, "list available revisions of density data for rollback")
	updateRequest := flag.String("update", "", "update the density data with this ")
	rollbackRequest := flag.String("rollback", "", "roll back current published data to this timestamp.  Use --list to find available timestamps")
	region := flag.String("region", "eu-west-1", "AWS region to target")
	stage := flag.String("stage", "CODE", "whether to upload data to CODE or PROD")
	flag.Parse()

	cfg, err := config.LoadDefaultConfig(context.Background(), config.WithRegion(*region))
	if err != nil {
		log.Fatalf("unable to initialise AWS SDK: %v", err)
	}
	lambdaClient := lambda.NewFromConfig(cfg)

	if *listRequest {
		req := ListDensityRequest{Mode: "list"}
		response, err := MakeRequest(context.Background(), lambdaClient, stage, &req)
		if err != nil {
			log.Fatalf("%s", err)
		}
		var content ListResponse
		err = json.Unmarshal(response, &content)
		if err != nil {
			log.Fatalf("Could not parse lambda response: %s", err)
		}
		fmt.Printf("The current version is %s (prepared %s)\n", content.Current.Format(time.RFC3339), content.Current.Format(time.RFC850))
		baseUrl := GetBaseUrl(stage)
		fmt.Printf("%s/densities/latest/densities.json\n\n", baseUrl)
		fmt.Printf("Other versions uploaded are:\n")
		for _, ts := range content.Revisions {
			fmt.Printf("- %s %s/densities/%s/densities.json\n", ts.Format(time.RFC3339Nano), baseUrl, ts.Format(time.RFC3339Nano))
		}
	} else if *rollbackRequest != "" {
		toDate, err := time.Parse(time.RFC3339, *rollbackRequest)
		if err != nil {
			log.Fatalf("'%s' is not a valid timestamp", *rollbackRequest)
		}
		req := RollbackDensityRequest{Mode: "rollback", ToDate: toDate}
		response, err := MakeRequest(context.Background(), lambdaClient, stage, &req)
		if err != nil {
			log.Fatalf("%s", err)
		}
		content, err := GetGenericResponse(response)
		if err != nil {
			log.Printf("Server response was: %s", string(response))
			log.Fatalf("Could not parse server response: %s", err)
		}
		if content.Status == "ok" {
			log.Printf("Rollback successful. Use --list to see the new state")
		} else {
			if content.Detail != nil {
				log.Printf("Rollback failed: %s", *content.Detail)
			} else {
				log.Printf("Rollback failed without a reason. Consult lambda logs.")
			}
			os.Exit(1)
		}
	} else if *updateRequest != "" {
		content, err := LoadDataFile(updateRequest)
		if err != nil {
			log.Fatalf("Could not load '%s': %s", *updateRequest, err)
		}
		req := UpdateDensityRequest{
			Mode: "update",
			CSVContent: &ContentDescriptionInline{
				Type:    "inline",
				Content: string(content),
			},
		}
		response, err := MakeRequest(context.Background(), lambdaClient, stage, &req)
		if err != nil {
			log.Fatalf("%s", err)
		}
		responseBody, err := GetGenericResponse(response)
		if err != nil {
			log.Printf("Server response was: %s", string(response))
			log.Fatalf("Could not parse server response: %s", err)
		}
		if responseBody.Status == "ok" {
			log.Printf("Publish successful. Use --list to see the new state")
		} else {
			if responseBody.Detail != nil {
				log.Printf("Publish failed: %s", *responseBody.Detail)
			} else {
				log.Printf("Publish failed without a reason. Consult lambda logs.")
			}
			os.Exit(1)
		}
	} else {
		log.Fatalf("Unrecognised command.  Use --help to see how to use this app")
	}
}
