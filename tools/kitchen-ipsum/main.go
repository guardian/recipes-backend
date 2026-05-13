package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	mrand "math/rand"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
)

const recipeBase = "https://recipes.code.dev-guardianapis.com"
const minRecipes = 2
const maxRecipes = 8

// containerNames preset list
var containerNames = []string{
	"Flavors of the World: A Culinary Adventure",
	"Quick & Tasty: Meals in 30 Minutes or Less",
	"Cozy Comfort: Recipes for Rainy Days",
	"Fresh & Light: A Taste of Summer",
	"Farm to Table: Fresh, Seasonal Delights",
	"Spice It Up: Bold Dishes for Adventurous Eaters",
	"Soul-Warming Stews for Cold Nights",
	"From the Oven: Bakes to Satisfy Any Craving",
	"Simply Delicious: 5-Ingredient Wonders",
	"One-Pot Magic: Easy Dishes, Minimal Cleanup",
	"Plant-Powered: Vibrant Vegan Creations",
	"Sweet Tooth Heaven: Desserts to Indulge In",
	"Family Favorites: Meals to Make Everyone Smile",
	"Weekend Brunch Goals: Recipes to Impress",
	"The Italian Kitchen: Pasta, Pizza, and More",
	"Healthy, Wholesome, & Hearty Bowls",
	"Sizzle & Sear: Grilled Goodness All Year Long",
	"Bringing the Heat: Fiery Flavors You'll Love",
	"Sweet & Savory Fusion: Unique Flavor Combos",
	"Global Comfort Foods: Your Favorite Dishes Reimagined",
	"Deliciously Decadent: Indulge in Every Bite",
	"Street Food Staples from Around the World",
	"Feast Your Eyes: Gourmet Meals Made Easy",
	"Healthy Habits: Nutritious Meals That Satisfy",
	"Hearty & Homestyle: Classic Comfort Dishes",
	"Elevated Everyday: Simple Meals, Sophisticated Taste",
	"Dinner Party Perfection: Dishes to Impress Guests",
	"Mediterranean Marvels: Fresh and Flavorful",
	"Master the Grill: Recipes for BBQ Lovers",
	"Crispy, Crunchy, & Full of Flavor",
	"Sweet Beginnings: Breakfast & Brunch Treats",
	"Summer BBQ Essentials: Flame-Kissed Goodness",
	"Flavors of Fall: Seasonal Recipes to Savor",
	"Aromatic & Rich: Perfect Curry Recipes",
	"Simple Snacks: Tasty Bites for Every Occasion",
	"Coastal Cooking: Seafood Recipes to Dive Into",
	"Warming Soups & Stews for Every Season",
	"Quick Bites: Appetizers for Any Occasion",
	"Baked to Perfection: Savory & Sweet Delights",
	"Wrap It Up: Easy and Delicious Wrap Recipes",
	"Delicious Detox: Clean Eating Recipes",
	"The Sweetest Treats: Baking Bliss Awaits",
	"Bold Flavors, Simple Prep: Quick Gourmet Meals",
	"Ultimate Game Day Grub: Crowd-Pleasing Snacks",
	"Feel-Good Foods: Healthy and Hearty",
	"Satisfy Your Cravings: Comfort Foods Redefined",
	"Light & Lovely: Perfect Salads for Any Meal",
	"Gluten-Free Goodies Everyone Will Love",
	"Breakfast in Bed: Recipes to Start the Day Right",
	"Ultimate Meat Lover’s Menu",
	"Under 500 Calories: Guilt-Free Gourmet",
	"For the Love of Chocolate: Irresistible Desserts",
	"Easy Entertaining: No-Fuss Party Foods",
	"Satisfying Sides: Perfect Complements to Any Meal",
	"Asian Fusion Feasts: Bold, Unique Flavors",
	"Lighter Fare: Meals That Won't Weigh You Down",
	"Sundays Made Simple: Slow Cooker Comfort",
	"Finger Food Fun: Deliciously Dippable Recipes",
	"Quick Fix: Weeknight Meals in a Flash",
	"Savory Sensations: Satisfying Soups to Savor",
	"Rustic Elegance: Country-Inspired Recipes",
	"Savory & Sweet: Perfect Pairings for Every Palate",
	"Tacos & Tequila: Mexican-Inspired Meals",
	"Lunchbox Love: Easy Meals to Take On-the-Go",
	"A Taste of the Tropics: Exotic Island Flavors",
	"Superfoods for Super You: Power-Packed Plates",
	"Midnight Munchies: Late Night Snacks You’ll Love",
	"Guilt-Free Desserts You Can’t Resist",
	"Pizza Party: Creative and Fun Toppings",
	"Fiesta Flavors: Mexican Favorites You’ll Adore",
	"Savory Bites: Delicious Dinner Ideas",
	"One-Pan Wonders: Fuss-Free Cooking",
	"Hearty Breakfasts to Fuel Your Day",
	"Tapas & Small Plates: Bite-Sized Bliss",
	"Picnic Perfection: Easy, Portable Recipes",
	"On a Roll: Perfect Sandwiches and Wraps",
	"Cheesy Comforts: Melty, Gooey Delights",
	"Heavenly Homestyle Baking: Recipes to Cherish",
	"Fresh From the Garden: Herb & Veggie-Packed Dishes",
	"A Taste of Italy: Recipes for Italian Food Lovers",
	"Fiery & Flavorful: Spicy Dishes to Heat Things Up",
	"Indulgent & Irresistible: Rich Dishes to Savor",
	"Refreshing & Light: Drinks and Smoothies to Sip",
	"Quick, Easy, & Delicious Breakfast Ideas",
	"Creamy & Dreamy: Comforting Pasta Dishes",
	"Flourless Feasts: Gluten-Free Wonders",
	"Slow-Cooked Success: Low & Slow, Big Flavor",
	"Bite-Sized Bliss: Perfect Hors d'Oeuvres",
	"A Dash of Citrus: Zesty Recipes That Shine",
	"Hearty Grain Bowls for Everyday Energy",
	"Sizzle & Spice: Southeast Asian Sensations",
	"Savory Pies: Perfect for Every Meal",
	"Breakfast Boost: Start Your Day Right",
	"Farmhouse Flavors: Rustic Recipes That Warm the Heart",
	"Satisfying Smoothies for Anytime",
	"Decadent Dinners: Treat Yourself Tonight",
	"Savory Brunch Ideas for Lazy Mornings",
	"Flour Power: Master the Art of Baking",
	"Festive Feasts: Holiday Recipes for Celebration",
	"Healthy Starts: Energizing Breakfast Recipes",
	"Global Grains: A World of Delicious Grains",
	"Perfect for Sharing: Family-Style Meals",
	"Sweet & Savory Creations for Any Mood",
}

// --- IMPLIED FUNCTIONALITY STUBS (Data Transfer Objects) ---

type SearchFilters struct {
	Diets      []string `json:"diets,omitempty"`
	FilterType string   `json:"filterType,omitempty"`
}

type SearchRequest struct {
	QueryText  string         `json:"queryText"`
	Format     string         `json:"format"`
	Limit      int            `json:"limit"`
	SearchType string         `json:"searchType"`
	Filters    *SearchFilters `json:"filters,omitempty"`
}

type RecipeResult struct {
	ID           string   `json:"id"`
	Title        string   `json:"title"`
	Contributors []string `json:"contributors"`
}

type SearchResponse struct {
	MaxScore float64        `json:"maxScore"`
	Results  []RecipeResult `json:"results"`
	Hits     int            `json:"hits"`
}

type Card struct {
	UUID                 string `json:"uuid"`
	FrontPublicationDate int64  `json:"frontPublicationDate"`
	CardType             string `json:"cardType"`
	ID                   string `json:"id"`
}

type CollectionData struct {
	ID           string `json:"id"`
	IsHidden     bool   `json:"isHidden"`
	LastUpdated  int64  `json:"lastUpdated"`
	UpdatedBy    string `json:"updatedBy"`
	UpdatedEmail string `json:"updatedEmail"`
	DisplayName  string `json:"displayName"`
	Items        []Card `json:"items"`
}

type UpdateCollectionRequest struct {
	Collection CollectionData `json:"collection"`
	ID         string         `json:"id"`
}

type FrontIssueItem struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
}

type IssueResponse struct {
	Fronts []FrontIssueItem `json:"fronts"`
}

type NewCollectionResponseItem struct {
	ID string `json:"id"`
}

// --- END STUBS ---

var ErrContinue = errors.New("continue on error")

func getFrontsURI(stage string) string {
	switch strings.ToUpper(stage) {
	case "PROD":
		log.Fatal("Don't run this against PROD")
	case "CODE":
		return "https://fronts.code.dev-gutools.co.uk"
	case "LOCAL":
		return "https://fronts.local.dev-gutools.co.uk"
	default:
		log.Fatal("--stage must be one of CODE or LOCAL")
	}
	return ""
}

// Helper to execute standard net/http requests
func doRequest(method, url, cookie string, body []byte) ([]byte, int, error) {
	var reqBody io.Reader
	if body != nil {
		reqBody = bytes.NewBuffer(body)
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, 0, err
	}

	req.Header.Set("Content-Type", "application/json")
	if cookie != "" {
		req.Header.Set("Cookie", cookie)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	return respBody, resp.StatusCode, err
}

func findRecipes(searchString string, count int, meatFree bool, cookie string) (*SearchResponse, error) {
	fmt.Printf("search term is '%s'\n", searchString)

	reqData := SearchRequest{
		QueryText:  searchString,
		Format:     "Full",
		Limit:      count,
		SearchType: "Embedded",
	}

	if meatFree {
		reqData.Filters = &SearchFilters{
			Diets:      []string{"vegetarian"},
			FilterType: "Post",
		}
	}

	bodyBytes, err := json.Marshal(reqData)
	if err != nil {
		return nil, err
	}

	respBody, statusCode, err := doRequest("POST", recipeBase+"/search", cookie, bodyBytes)
	if err != nil {
		return nil, err
	}

	if statusCode != 200 {
		return nil, fmt.Errorf("Server error %d: %s", statusCode, string(respBody))
	}

	var parsedResp SearchResponse
	err = json.Unmarshal(respBody, &parsedResp)
	if err != nil {
		return nil, err
	}

	return &parsedResp, nil
}

func buildCard(recipeIndexEntry RecipeResult) (Card, error) {
	if recipeIndexEntry.ID == "" {
		return Card{}, errors.New("Can't build card as recipeIndexEntry has no id")
	}
	return Card{
		UUID:                 uuid.New().String(),
		FrontPublicationDate: time.Now().UnixMilli(),
		CardType:             "recipe",
		ID:                   recipeIndexEntry.ID,
	}, nil
}

func makeNewCollection(collectionName, frontID, frontsBaseUrl, cookie string) (string, error) {
	urlPath := fmt.Sprintf("%s/editions-api/fronts/%s/collection?name=%s", frontsBaseUrl, frontID, url.QueryEscape(collectionName))
	
	respBody, statusCode, err := doRequest("PUT", urlPath, cookie, nil)
	if err != nil {
		return "", err
	}

	if statusCode != 200 {
		return "", fmt.Errorf("Error creating new collection: %d %s", statusCode, string(respBody))
	}

	fmt.Printf("Collection with title '%s' added to front %s\n", collectionName, frontID)

	var newColResp []NewCollectionResponseItem
	err = json.Unmarshal(respBody, &newColResp)
	if err != nil || len(newColResp) == 0 {
		return "", errors.New("Unable to parse new collection response")
	}

	return newColResp[0].ID, nil
}

func updateCollectionContents(collectionID, collectionName string, cards []Card, frontsBaseUrl, cookie string) error {
	reqData := UpdateCollectionRequest{
		Collection: CollectionData{
			ID:           collectionID,
			IsHidden:     false,
			LastUpdated:  time.Now().UnixMilli(),
			UpdatedBy:    "autofill script",
			UpdatedEmail: "andy.gallagher@guardian.co.uk",
			DisplayName:  collectionName,
			Items:        cards,
		},
		ID: collectionID,
	}

	bodyBytes, err := json.Marshal(reqData)
	if err != nil {
		return err
	}

	urlPath := fmt.Sprintf("%s/editions-api/collections/%s", frontsBaseUrl, collectionID)
	respBody, statusCode, err := doRequest("PUT", urlPath, cookie, bodyBytes)
	if err != nil {
		return err
	}

	if statusCode != 200 {
		return fmt.Errorf("Unable to update collection with ID %s, server said %d %s", collectionID, statusCode, string(respBody))
	}

	return nil
}

func searchTermFromCollectionName(collectionName string) string {
	idx := strings.LastIndex(collectionName, ":")
	if idx > 0 && idx < len(collectionName)-1 {
		return strings.TrimSpace(collectionName[idx+1:])
	}
	return collectionName
}

func buildCollection(collectionName, frontID string, count int, filter, frontsBaseUrl, cookie string) error {
	isMeatFree := filter == "veg" || filter == "vegetarian"
	recipes, err := findRecipes(searchTermFromCollectionName(collectionName), count, isMeatFree, cookie)
	if err != nil {
		return err
	}

	if recipes.MaxScore < 0.7 {
		return fmt.Errorf("%w: No reliable results for '%s' as a search string", ErrContinue, collectionName)
	}

	fmt.Printf("Selected %d recipes with max confidence of %f\n", len(recipes.Results), recipes.MaxScore)
	for _, r := range recipes.Results {
		fmt.Printf("\t%s %v\n", r.Title, r.Contributors)
	}

	newCollectionID, err := makeNewCollection(collectionName, frontID, frontsBaseUrl, cookie)
	if err != nil {
		return err
	}

	var recipeCards []Card
	for _, r := range recipes.Results {
		card, err := buildCard(r)
		if err != nil {
			return err
		}
		recipeCards = append(recipeCards, card)
	}

	return updateCollectionContents(newCollectionID, collectionName, recipeCards, frontsBaseUrl, cookie)
}

func frontNameToID(issueID, frontName, frontsBaseUrl, cookie string) (string, error) {
	urlPath := fmt.Sprintf("%s/editions-api/issues/%s", frontsBaseUrl, issueID)
	respBody, statusCode, err := doRequest("GET", urlPath, cookie, nil)
	if err != nil {
		return "", err
	}

	if statusCode != 200 {
		return "", fmt.Errorf("Unable to map name to ID, server said %d %s", statusCode, string(respBody))
	}

	var issueResp IssueResponse
	err = json.Unmarshal(respBody, &issueResp)
	if err != nil {
		return "", err
	}

	for _, front := range issueResp.Fronts {
		if front.DisplayName == frontName {
			return front.ID, nil
		}
	}
	return "", nil
}

func main() {
	// Standard library 'flag' setup
	stage := flag.String("stage", "", "set this to LOCAL or CODE. Don't run against PROD.")
	frontsIssueID := flag.String("fronts-issue-id", "", "the issue containing the fronts to populate.")
	frontName := flag.String("front-name", "", "either 'All Recipes' or 'Meat-Free'.")
	cookie := flag.String("cookie", "", "set of cookies containing authorization.")
	collectionCount := flag.Int("collection-count", 1, "number of collections to generate.")
	filter := flag.String("filter", "", "can be set to 'veg' or 'vegetarian'.")
	flag.Parse()

	if *stage == "" || *frontsIssueID == "" || *frontName == "" || *cookie == "" {
		fmt.Println("Missing required arguments.")
		flag.Usage()
		os.Exit(2)
	}

	frontsBaseUrl := getFrontsURI(*stage)
	
	mrand.Seed(time.Now().UnixNano())

	frontID, err := frontNameToID(*frontsIssueID, *frontName, frontsBaseUrl, *cookie)
	if err != nil {
		log.Fatalf("Error finding front ID: %v", err)
	}
	if frontID == "" {
		log.Fatalf("Front name '%s' not found in issue '%s'", *frontName, *frontsIssueID)
	}

	fmt.Printf("ID of front %s is %s. Looking to generate %d collections\n", *frontName, frontID, *collectionCount)

	for i := 0; i < *collectionCount; i++ {
		titleSelector := mrand.Intn(len(containerNames))
		targetRecipeCount := mrand.Intn(maxRecipes-minRecipes+1) + minRecipes

		fmt.Printf("Generating a collection of %d for '%s'\n", targetRecipeCount, containerNames[titleSelector])

		err := buildCollection(containerNames[titleSelector], frontID, targetRecipeCount, *filter, frontsBaseUrl, *cookie)
		if err != nil {
			if errors.Is(err, ErrContinue) {
				fmt.Println("Warning:", err)
			} else {
				fmt.Println("Error:", err)
				break
			}
		}
	}
}