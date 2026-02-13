export default {
  "name": "Vote",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Vote title"
    },
    "description": {
      "type": "string",
      "description": "Vote description"
    },
    "vote_type": {
      "type": "string",
      "enum": [
        "poll",
        "referendum",
        "election"
      ],
      "default": "poll"
    },
    "status": {
      "type": "string",
      "enum": [
        "draft",
        "active",
        "closed"
      ],
      "default": "draft"
    },
    "start_date": {
      "type": "string",
      "format": "date-time"
    },
    "end_date": {
      "type": "string",
      "format": "date-time"
    },
    "options": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Vote options"
    },
    "results": {
      "type": "object",
      "description": "Vote results tally"
    }
  },
  "required": [
    "title",
    "description",
    "options"
  ]
}
