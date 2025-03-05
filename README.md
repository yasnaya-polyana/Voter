# Voter

Secure, transparent, and decentralized voting powered by blockchain technology.

![Project Screenshot](vote-app/public/images/frontImage.png)

## Overview

SmartVote is an innovative voting system built on near-protocol smart contracts, to ensure secure, transparent, and decentralized voting processes. This application provides a user-friendly interface for participating in blockchain-based voting events.

## Key Features

- Decentralized voting using near-protocol smart contracts
- Transparent and immutable vote records
- Secure voter authentication
- Real-time vote counting and results
- Customizable voting parameters for different scenarios

## Getting Started

### Using Docker (Recommended)

1. Install Docker and Docker Compose on your machine
   - [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
   - [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
   - [Docker Engine for Linux](https://docs.docker.com/engine/install/)

2. Clone the repository
   ```bash
   git clone https://github.com/yasnaya-polyana/vote-app.git
   cd vote-app
   ```

3. Create a `.env` file in the root directory:
   ```
   POSTGRES_URL=your_postgres_connection_string
   NEXT_PUBLIC_NEAR_NETWORK=testnet
   NEXT_PUBLIC_NEAR_CONTRACT_NAME=your_contract_name.testnet
   ```

4. Start the application in development mode:
   ```bash
   docker-compose up --build
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Development Commands

```bash
# Start the application
docker-compose up

# Rebuild and start
docker-compose up --build

# Stop the application
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build web
```

### Without Docker (Alternative)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `/app`: Contains the main application code
  - `/components`: Reusable React components
  - `/context`: React context for state management
  - `/lib`: Utility functions and configurations
  - `/api`: API route handlers

- `/contract-as`: Smart contract code
  - `/assembly`: AssemblyScript contract source
  - `/build`: Compiled contract files

- `/public`: Static assets

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- MongoDB
- NEAR Protocol (Web3.js)
- Tailwind CSS
- Docker
- Javascript (Smart Contracts)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
