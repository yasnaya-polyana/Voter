# Voter

Secure, transparent, and decentralized voting powered by blockchain technology.

![Project Screenshot](vote-app/public/frontImage.png)

## Overview

Voter is an innovative voting system built on NEAR Protocol smart contracts, ensuring secure, transparent, and decentralized voting processes. This application provides a user-friendly interface for creating and participating in blockchain-based voting events with real-time results and verification.

## Key Features

- **Multi-User Roles**: Support for voters, campaign creators, and administrators
- **Blockchain Integration**: Decentralized voting using NEAR Protocol smart contracts
- **Transparent Records**: Immutable vote records with blockchain verification
- **Campaign Management**: Create, customize, and manage voting campaigns
- **Real-time Results**: Live vote counting and result visualization
- **Admin Dashboard**: Comprehensive system management and statistics
- **User Authentication**: Secure login with email/password and NEAR wallet connection
- **Public & Private Campaigns**: Support for both public and private voting events
- **Vote Verification**: Verify votes through blockchain transaction hashes
- **Mobile Responsive**: Fully responsive design for all devices

## User Roles

The application supports three distinct user types:

1. **Voter**
   - Cast votes in public and private campaigns
   - View personal voting history
   - Verify votes on the blockchain
   - Connect NEAR wallet for blockchain interactions

2. **Campaign Creator**
   - Create and manage voting campaigns
   - Add and edit candidates
   - Set campaign parameters (start/end dates, public/private)
   - View real-time voting results
   - Export campaign data

3. **Administrator**
   - Access comprehensive system statistics
   - Manage all users and campaigns
   - Fix vote count discrepancies
   - Delete users and campaigns
   - Create additional admin accounts

## Detailed Setup Guide

### Prerequisites

- Node.js 16.x or higher
- MongoDB 4.4 or higher
- NEAR account (for blockchain features)
- Git

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Voter.git
   cd Voter/vote-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment files**

   Create a `.env.local` file in the `vote-app` directory with the following variables:

   ```
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/voter?retryWrites=true&w=majority

   # NEAR Configuration
   NEXT_PUBLIC_NEAR_NETWORK=testnet
   NEXT_PUBLIC_NEAR_CONTRACT_NAME=your_contract_name.testnet
   NEXT_PUBLIC_NEAR_NODE_URL=https://rpc.testnet.near.org

   # Application Security
   NEXTAUTH_SECRET=your_nextauth_secret_key
   ADMIN_API_KEY=your_admin_api_key_for_protected_routes

   # Optional: Email Service (for notifications)
   EMAIL_SERVER=smtp://username:password@smtp.example.com:587
   EMAIL_FROM=noreply@yourdomain.com
   ```

4. **Set up MongoDB**
   - Create a MongoDB Atlas account or use a local MongoDB instance
   - Create a database named `voter`
   - Update the `MONGODB_URI` in your `.env.local` file

5. **Set up NEAR account**
   - Create a NEAR testnet account at https://wallet.testnet.near.org/
   - Deploy the voting smart contract (see Smart Contract Setup below)
   - Update the `NEXT_PUBLIC_NEAR_CONTRACT_NAME` in your `.env.local` file

### Running the Application


3. **Using Docker**
   ```bash
   # Build and start containers
   docker-compose up --build

   # Stop containers
   docker-compose down
   ```

### Smart Contract Setup

1. **Install NEAR CLI**
   ```bash
   npm install -g near-cli
   ```

2. **Login to your NEAR account**
   ```bash
   near login
   ```

3. **Deploy the smart contract**
   ```bash
   cd contract-as
   npm install
   npm run build
   near deploy --accountId your_account.testnet --wasmFile build/release/voting.wasm
   ```

4. **Initialize the contract**
   ```bash
   near call your_account.testnet init '{}' --accountId your_account.testnet
   ```

### Creating an Admin User

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Access the admin creation page**
   Navigate to http://localhost:3000/admin/create

3. **Create the first admin user**
   - Fill in the email, password, and name
   - Use the ADMIN_API_KEY from your .env.local file
   - Submit the form to create the admin account

4. **Login with the admin account**
   Navigate to http://localhost:3000/login and use the admin credentials

## Database Schema

The application uses MongoDB with the following main collections:

1. **Users**
   - Email, password (hashed), name, user type (voter/campaign/admin)

2. **Campaigns**
   - Campaign details, start/end dates, candidates, vote counts, blockchain ID

3. **Votes**
   - Vote records, user ID, campaign ID, candidate voted for, blockchain transaction hash

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/signup` - User registration

### Campaigns
- `GET /api/campaigns` - Get active campaigns
- `GET /api/campaigns/all` - Get all campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns` - Create a campaign
- `PATCH /api/campaigns/:id` - Update a campaign
- `POST /api/campaigns/:id/vote` - Cast a vote

### Admin
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `DELETE /api/admin/users/:id` - Delete a user
- `DELETE /api/admin/campaigns/:id` - Delete a campaign
- `POST /api/admin/create` - Create an admin user

## Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**
   - Verify your MongoDB URI is correct
   - Ensure your IP address is whitelisted in MongoDB Atlas
   - Check network connectivity to your MongoDB instance

2. **NEAR Wallet Connection Issues**
   - Ensure you're using the correct network (testnet/mainnet)
   - Verify your browser supports Web3 connections
   - Clear browser cache and try again


### Logs

Application logs are available:
- In the console when running in development mode
- In Docker logs when using Docker (`docker-compose logs -f`)
- In your hosting platform's log system when deployed


### Other Platforms


## Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS, DaisyUI
- **Backend**: Node.js, Next.js API Routes
- **Database**: MongoDB
- **Blockchain**: NEAR Protocol, near-api-js
- **Authentication**: Custom auth with JWT
- **Containerization**: Docker, Docker Compose
- **Testing**: Jest, React Testing Library


## License

This project is licensed under the MIT License.

## Acknowledgements

Built by Oscar Linehan, March 2025
