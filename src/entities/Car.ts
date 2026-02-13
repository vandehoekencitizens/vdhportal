{
  "name": "Car",
  "type": "object",
  "properties": {
    "make": {
      "type": "string",
      "description": "Car manufacturer"
    },
    "model": {
      "type": "string",
      "description": "Car model"
    },
    "year": {
      "type": "number",
      "description": "Manufacturing year"
    },
    "price": {
      "type": "number",
      "description": "Price in VHS"
    },
    "mileage": {
      "type": "number",
      "description": "Mileage in kilometers"
    },
    "color": {
      "type": "string",
      "description": "Car color"
    },
    "description": {
      "type": "string",
      "description": "Car description"
    },
    "image_url": {
      "type": "string",
      "description": "Car image URL"
    },
    "status": {
      "type": "string",
      "enum": [
        "available",
        "sold",
        "pending"
      ],
      "default": "available"
    }
  },
  "required": [
    "make",
    "model",
    "year",
    "price"
  ]
}
