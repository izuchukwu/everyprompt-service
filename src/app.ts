/* eslint-disable no-console */
import express from 'express'
import compression from 'compression'
import cors from 'cors'
import dotenv from 'dotenv'
import {nanoid} from 'nanoid'
import {z} from 'zod'
import fetch from 'cross-fetch'

/* -- Environment -- */

dotenv.config()
const isProduction = process.env.NODE_ENV === 'production'
const everypromptAPIKey = process.env.EVERYPROMPT_API_KEY ?? undefined
const domainWhitelist = JSON.parse(process.env.DOMAIN_WHITELIST ?? '[]')
const port = process.env.PORT || 9999

// Add the `id` field to Requests
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			requestID?: string
			sessionID?: string
		}
	}
}

/* -- App Setup -- */

const app = express()
app.use(compression())
app.disable('x-powered-by')

// Trust our proxy (our load balancer) so we can receive client IP addresses
app.set('trust proxy', 1)

// Parse JSON bodies
app.use(express.json())

// Log all requests
app.use((req, _res, next) => {
	req.requestID = nanoid(6)
	console.log(
		`[${req.requestID}]`,
		`↘ Request Received — ${req.method} ${req.path}`
	)
	next()
})

/* -- CORS -- */

// nathandavison.com/blog/be-careful-with-authenticated-cors-and-secrets-like-csrf-tokens
// stackoverflow.com/a/53953993

/* Access-Control-Allow-Origin */
app.use(
	cors({
		origin: isProduction ? domainWhitelist : true
	})
)

/* -- Routes -- */

const promptReqFormat = z.object({
	user: z.string(),
	variables: z.object({}).catchall(z.string())
})

// Prompt route
app.post('/prompt/:teamID/:functionID', async (req, res) => {
	// Get teamID and functionID from URL
	const {teamID, functionID} = req.params

	// Get the userID and variables from body
	const parsedReq = promptReqFormat.safeParse(req.body)
	if (!parsedReq.success) {
		console.error(`Failed to run prompt. Bad Request: ${parsedReq.error}`)
		res.send({success: false, error: 0})
		return
	}
	const {user, variables} = parsedReq.data

	// Call Everyprompt
	const epRes = await fetch(
		`https://www.everyprompt.com/api/v0/calls/${teamID}/${functionID}`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${everypromptAPIKey}`
			},
			body: JSON.stringify({user, variables})
		}
	)
	const epJSON = await epRes.json()

	// Return Everyprompt result
	res.status(epRes.status).send({success: epRes.ok, response: epJSON})
})

// Health checks
app.get('/', (_req, res) => res.send('👍'))

/* -- App Start -- */

// Start the app
app.listen(port, () => {
	console.log(`Now running on port http://localhost:${port} 🌱`)
})

export {}
