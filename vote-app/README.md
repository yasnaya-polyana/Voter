# SmartVote

Secure, transparent, and decentralized voting powered by blockchain technology.

![Project Screenshot](public/images/frontImage.png)

## Overview

SmartVote is an innovative voting system built on Ethereum blockchain technology, leveraging the power of smart contracts to ensure secure, transparent, and decentralized voting processes. This application provides a user-friendly interface for participating in blockchain-based voting events.

## Key Features

- Decentralized voting using Ethereum smart contracts
- Transparent and immutable vote records
- Secure voter authentication
- Real-time vote counting and results
- Customizable voting parameters for different scenarios

## How It Works

SmartVote utilizes Ethereum smart contracts to create a trustless voting environment. Each vote is recorded as a transaction on the Ethereum blockchain, ensuring transparency and preventing tampering. Our system allows for various voting mechanisms, from simple yes/no decisions to more complex multi-candidate elections.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory and add:
   ```
   POSTGRES_URL=your_postgres_connection_string
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app`: Contains the main application code
  - `/components`: Reusable React components
  - `/context`: React context for state management

- `/public`: Static assets

## Technologies Used

- Next.js
- React
- TypeScript
- PostgreSQL
- Ethereum (Web3.js)
- Tailwind CSS

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.