{
  "name": "JobAssignment",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "Employee email"
    },
    "job_id": {
      "type": "string",
      "description": "Reference to Job entity"
    },
    "job_title": {
      "type": "string",
      "description": "Job title"
    },
    "daily_salary": {
      "type": "number",
      "description": "Daily salary in VHS"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "terminated"
      ],
      "default": "active"
    },
    "start_date": {
      "type": "string",
      "format": "date"
    }
  },
  "required": [
    "user_email",
    "job_title",
    "daily_salary"
  ]
}
