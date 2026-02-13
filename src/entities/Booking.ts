{
  "name": "Booking",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "User email"
    },
    "booking_type": {
      "type": "string",
      "enum": [
        "flight",
        "rail"
      ],
      "description": "Type of booking"
    },
    "reference_id": {
      "type": "string",
      "description": "Flight or Rail ID"
    },
    "booking_reference": {
      "type": "string",
      "description": "Unique booking reference"
    },
    "passenger_name": {
      "type": "string",
      "description": "Passenger name"
    },
    "seat_number": {
      "type": "string",
      "description": "Assigned seat"
    },
    "price_paid": {
      "type": "number",
      "description": "Amount paid in VHS"
    },
    "status": {
      "type": "string",
      "enum": [
        "confirmed",
        "cancelled"
      ],
      "default": "confirmed"
    },
    "departure_city": {
      "type": "string"
    },
    "arrival_city": {
      "type": "string"
    },
    "departure_time": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": [
    "user_email",
    "booking_type",
    "reference_id",
    "passenger_name",
    "price_paid"
  ]
}
