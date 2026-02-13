export default {
  "name": "OfficeDeclaration",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "User email"
    },
    "micronation_name": {
      "type": "string",
      "description": "Name of the micronation"
    },
    "office_title": {
      "type": "string",
      "description": "Office/position held"
    },
    "start_date": {
      "type": "string",
      "format": "date"
    },
    "end_date": {
      "type": "string",
      "format": "date"
    },
    "description": {
      "type": "string",
      "description": "Description of duties"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "approved",
        "rejected"
      ],
      "default": "pending"
    },
    "admin_notes": {
      "type": "string"
    }
  },
  "required": [
    "user_email",
    "micronation_name",
    "office_title"
  ]
}
