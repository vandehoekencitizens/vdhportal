export default {
  "name": "MarketplaceItem",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Item name"
    },
    "description": {
      "type": "string",
      "description": "Item description"
    },
    "price": {
      "type": "number",
      "description": "Price in VHS"
    },
    "stock": {
      "type": "number",
      "description": "Available quantity"
    },
    "category": {
      "type": "string",
      "enum": [
        "goods",
        "services"
      ],
      "default": "goods"
    },
    "image_url": {
      "type": "string",
      "description": "Product image URL"
    }
  },
  "required": [
    "name",
    "price",
    "stock"
  ]
}
