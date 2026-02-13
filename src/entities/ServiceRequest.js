export default {
  "name": "ServiceRequest",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "Requesting citizen email"
    },
    "request_type": {
      "type": "string",
      "enum": [
        "permit",
        "utility",
        "issue_report",
        "document",
        "other"
      ],
      "description": "Type of service request"
    },
    "title": {
      "type": "string",
      "description": "Request title"
    },
    "description": {
      "type": "string",
      "description": "Detailed description"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "in_review",
        "approved",
        "rejected",
        "completed"
      ],
      "default": "pending"
    },
    "admin_notes": {
      "type": "string",
      "description": "Internal admin notes"
    },
    "priority": {
      "type": "string",
      "enum": [
        "low",
        "medium",
        "high",
        "urgent"
      ],
      "default": "medium"
    }
  },
  "required": [
    "user_email",
    "request_type",
    "title",
    "description"
  ]
}
