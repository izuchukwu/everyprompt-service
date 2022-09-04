# Everyprompt Service

A simple service that proxies Everyprompt requests so that the front-end does not contain the API key.

## Config

Requires the following env vars:

- `EVERYPROMPT_API_KEY: string`
- `DOMAIN_WHITELIST: string[]`

## Routes

### `POST /prompt/:teamID/:functionID`

No auth req'd. Sample body:
```json
{
	"userID": "testing",
	"variables": {
		"foo": "bar"
	}
}
```