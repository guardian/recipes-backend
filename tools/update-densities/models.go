package main

import (
	"encoding/json"
	"fmt"
	"time"
)

// ContentDescriptionS3 represents z.object({ type: z.literal('s3'), ... })
type ContentDescriptionS3 struct {
	Type   string `json:"type"` // value: "s3"
	Path   string `json:"path"`
	Bucket string `json:"bucket"`
}

// ContentDescriptionInline represents z.object({ type: z.literal('inline'), ... })
type ContentDescriptionInline struct {
	Type    string `json:"type"` // value: "inline"
	Content string `json:"content"`
}

// UpdateDensityRequest represents the "update" mode
type UpdateDensityRequest struct {
	Mode string `json:"mode"` // value: "update"
	// csvContent is a union. We use json.RawMessage to delay parsing
	// until we know the type (s3 vs inline).
	CSVContent any `json:"csvContent"`
}

// ListDensityRequest represents the "list" mode
type ListDensityRequest struct {
	Mode string `json:"mode"` // value: "list"
}

// RollbackDensityRequest represents the "rollback" mode
type RollbackDensityRequest struct {
	Mode   string    `json:"mode"` // value: "rollback"
	ToDate time.Time `json:"toDate"`
}

// UpdateRequestWrapper is a helper struct to handle the polymorphic UpdateRequest union
type UpdateRequestWrapper struct {
	Mode string `json:"mode"`
	Raw  json.RawMessage
}

// GenericResponse represents a standard ok/error response
type GenericResponse struct {
	Status string  `json:"status"` // "ok" | "error"
	Detail *string `json:"detail"` // Pointer allows for null
}

// ListResponse represents the specific response for the list mode
type ListResponse struct {
	Status    string      `json:"status"`  // value: "ok"
	Current   *time.Time  `json:"current"` // Pointer allows for null
	Revisions []time.Time `json:"revisions"`
}

// DensityJson represents the top-level structure of the compact density data.
type DensityJson struct {
	// PreparedAt indicates when the result was generated (ISO-8601).
	PreparedAt time.Time `json:"prepared_at"`

	// Key defines the column names, strictly: ["id", "name", "normalised_name", "density"].
	Key []string `json:"key"`

	// Values is a slice of rows, where each row is [id, name, normalised_name, density].
	// Because the types in the inner array are mixed, we use []interface{}.
	Values [][]interface{} `json:"values"`
}

// DensityRow provides a type-safe way to interact with the raw interface slice.
type DensityRow struct {
	ID             int64
	Name           string
	NormalisedName string
	Density        float64
}

// ToDensityRows converts the compact interface slices into typed DensityRow structs.
// It uses a deferred recovery to catch type assertion panics if the input JSON
// doesn't match the expected schema types.
func (d *DensityJson) ToDensityRows() (rows []DensityRow, err error) {
	// Panic handler to catch unexpected type assertion failures
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("failed to parse density values: %v", r)
			rows = nil // Ensure we don't return partial/corrupt data
		}
	}()

	rows = make([]DensityRow, 0, len(d.Values))

	for _, v := range d.Values {
		// Basic length check to prevent index out of bounds panics
		if len(v) < 4 {
			return nil, fmt.Errorf("row has insufficient columns: expected 4, got %d", len(v))
		}

		// These assertions will panic if the types are wrong.
		// The deferred function above will catch them.
		row := DensityRow{
			ID:             int64(v[0].(float64)),
			Name:           v[1].(string),
			NormalisedName: v[2].(string),
			Density:        v[3].(float64),
		}

		rows = append(rows, row)
	}

	return rows, nil
}

func ParseRow(row []interface{}) (outRow DensityRow, err error) {
	// Panic handler to catch unexpected type assertion failures
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("failed to parse density values: %v", r)
		}
	}()

	if len(row) < 4 {
		return DensityRow{}, fmt.Errorf("row has insufficient columns: expected 4, got %d", len(row))
	}

	return DensityRow{
		ID:             int64(row[0].(float64)),
		Name:           row[1].(string),
		NormalisedName: row[2].(string),
		Density:        row[3].(float64),
	}, nil
}
