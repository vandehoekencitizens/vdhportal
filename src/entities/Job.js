export default {
  "name": "Job",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Job title"
    },
    "department": {
      "type": "string",
      "description": "Government department"
    },
    "description": {
      "type": "string",
      "description": "Job description"
    },
    "salary": {
      "type": "number",
      "description": "Daily salary in VHS"
    },
    "location": {
      "type": "string",
      "description": "Job location"
    },
    "type": {
      "type": "string",
      "enum": [
        "Full-time",
        "Part-time",
        "Contract"
      ],
      "default": "Full-time"
    },
    "status": {
      "type": "string",
      "enum": [
        "open",
        "closed"
      ],
      "default": "open"
    }
  },
  "required": [
    "title",
    "department",
    "description"
  ]
}
