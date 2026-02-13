{
  "name": "House",
  "type": "object",
  "properties": {
    "address": {
      "type": "string",
      "description": "Property address"
    },
    "price": {
      "type": "number",
      "description": "Price in VHS"
    },
    "bedrooms": {
      "type": "number",
      "description": "Number of bedrooms"
    },
    "bathrooms": {
      "type": "number",
      "description": "Number of bathrooms"
    },
    "sqft": {
      "type": "number",
      "description": "Square footage"
    },
    "description": {
      "type": "string",
      "description": "Property description"
    },
    "image_url": {
      "type": "string",
      "description": "Property image URL"
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
    "address",
    "price"
  ]
}
