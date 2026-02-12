package main

import (
	"encoding/json"
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
