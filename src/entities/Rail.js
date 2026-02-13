export default {
  "name": "Rail",
  "type": "object",
  "properties": {
    "train_number": {
      "type": "string",
      "description": "Train number"
    },
    "departure_station": {
      "type": "string",
      "description": "Departure station"
    },
    "arrival_station": {
      "type": "string",
      "description": "Arrival station"
    },
    "departure_time": {
      "type": "string",
      "format": "date-time",
      "description": "Departure date and time"
    },
    "arrival_time": {
      "type": "string",
      "format": "date-time",
      "description": "Arrival date and time"
    },
    "train_model": {
      "type": "string",
      "description": "Train model"
    },
    "price": {
      "type": "number",
      "description": "Ticket price in VHS"
    },
    "available_seats": {
      "type": "number",
      "description": "Available seats"
    },
    "status": {
      "type": "string",
      "enum": [
        "scheduled",
        "boarding",
        "departed",
        "arrived",
        "cancelled"
      ],
      "default": "scheduled"
    }
  },
  "required": [
    "train_number",
    "departure_station",
    "arrival_station",
    "departure_time",
    "price"
  ]
}
