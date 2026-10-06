# incwo connector kit for Muse

[Français](README.md) · [Español](README.es.md)

This kit provides a **read-only** HTTP bridge and an OpenAPI description for proposing a custom incwo connector to [Muse](https://www.meta.com/en-gb/help/artificial-intelligence/1687253048996149/). The bridge exposes contact and firm lists only. It uses XML routes documented by the [incwo API](https://www.incwo.com/site/developer) and returns XML inside a JSON envelope. No password or token is stored in the repository.

## Start

Create three private files containing a long bridge token, the incwo API username, and the incwo API password, respectively. Give each file mode 600. Set CONNECTOR_TOKEN_FILE, INCWO_USER_FILE, INCWO_PASSWORD_FILE, and INCWO_API_BASE_URL to the API URL for your incwo account. Run npm start; by default the service listens only on 127.0.0.1:8787. Run npm test for local checks.

For remote connection, put the bridge behind an authenticated HTTPS server, replace the example URL in openapi.yaml, then ask Muse to create a custom connector using this description and its documentation. Provide the token through Muse's credential store, never in the conversation. The kit is for one incwo account per deployment; deploy an isolated instance per account.

Tests establish write and route rejection against a simulated server. They do not establish authentication to a real incwo account, OpenAPI import by Muse, or Meta's approval of the connector. Start with a read and verify actual permissions before use.

MIT licensed.
