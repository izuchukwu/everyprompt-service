# Everyprompt Service

A simple service that proxies Everyprompt requests so that the front-end does not contain the API key.

## Config

Requires the following env vars:

- `EVERYPROMPT_API_KEY: string`
- `DOMAIN_WHITELIST: string[]`

## Routes

### `POST /prompt`

No auth req'd. Sample body:
```json
{
	"url": "https://everyprompt.com/[userID]/functions/[functionName]",
	"userID": "testing",
	"variables": {
		"foo": "bar"
	}
}
```