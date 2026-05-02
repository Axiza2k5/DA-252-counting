## 🔐 Authentication System
- **Security**: [Passlib (bcrypt)](https://passlib.readthedocs.io/), [PyJWT](https://pyjwt.readthedocs.io/)

The application implements a secure OAuth2-compatible authentication flow using JSON Web Tokens (JWT).

### Flow Overview
1. **Registration**: User creates an account via `/register`. Passwords are encrypted using `bcrypt`.
2. **Login**: User provides credentials to `/login`. Upon success, the server returns both an `access_token` and a `refresh_token`.
3. **Authorized Requests**: The `access_token` must be included in the `Authorization: Bearer <token>` header for protected endpoints (`/predict`).
4. **Token Refresh**: When the `access_token` expires, the user can call `/refresh` with their `refresh_token` to receive a new `access_token` without re-entering credentials.

### Token Specifications
| Token Type | Claim (`type`) | Default Expiry | Purpose |
| :--- | :--- | :--- | :--- |
| **Access** | `access` | 60 Minutes | Used for authorizing API requests. |
| **Refresh** | `refresh` | 90 Days | Used to generate new access tokens. |

### Configuration (`.env`)
The following variables control the authentication behavior:
```env
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=90
```

## 📋 API Endpoints

### User Management
- `POST /register`: Create a new user account.
- `POST /login`: Authenticate and receive access/refresh tokens.
- `POST /refresh`: Obtain a new access token using a valid refresh token.

### Seed Counting
- `POST /predict`: **(Protected)** Upload an image to detect and count seeds.
    - **Accepts**: `image/jpeg`, `image/png`, `image/webp` (Max 10MB).
    - **Returns**: Count, detection coordinates, processing time, and a Base64 encoded result image.

### Health Check
- `GET /health`: Returns the status of the API.

## 🛠 Getting Started

### Prerequisites
- Python 3.12
- [YOLOv26 Model File](best.pt) (must be placed in the root directory)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file based on `.env.example`.
4. Run the application:
   ```bash
   uvicorn main:app --reload
   ```