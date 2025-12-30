# AWS Free Tier Deployment Guide

This guide details how to deploy your Next.js + NestJS application on AWS using the **Free Tier** (12 months free).

## Usage
- **Frontend** (Next.js): Deployed on **AWS Amplify**.
- **Backend** (NestJS): Deployed on an **EC2 Instance** (free t2.micro) with Docker.
- **Database** (PostgreSQL): Hosted on **AWS RDS** (free db.t3.micro).

---

## Part 1: Database Setup (AWS RDS) 🐘

1.  **Log in** to AWS Console > Search for **RDS**.
2.  Click **Create database**.
3.  Choose **Standard create** > **PostgreSQL**.
4.  **Templates**: Select **Free tier**.
5.  **Settings**:
    - Master username: `postgres`
    - Master password: (Create a strong password and save it)
6.  **Instance configuration**: `db.t3.micro` (should be selected by default).
7.  **Connectivity**:
    - **Public access**: **Yes** (Easier for setup, restricting later is better security).
    - **VPC Security Group**: Create new > Name it `rds-sg`.
8.  Click **Create database**.
9.  ⏳ **Wait**: It takes 5-10 minutes.
10. **Get Connection URL**:
    - Once available, click the DB identifier > Copy the **Endpoint** (e.g., `tmdb.cxyz.us-east-1.rds.amazonaws.com`).
    - Construct your URL:
      `postgresql://postgres:YOUR_PASSWORD@ENDPOINT_URL:5432/postgres`

---

## Part 2: Backend Setup (AWS EC2) 🚀

1.  **Search for EC2** > **Launch Instance**.
2.  **Name**: `wise-backend`.
3.  **OS**: **Ubuntu** (Server 24.04 LTS).
4.  **Instance Type**: `t2.micro` (Free tier eligible).
5.  **Key Pair**: Create new key pair > Download `.pem` file.
6.  **Network**: Check "Allow HTTP traffic from the internet".
7.  Click **Launch Instance**.

### Configure Security Group
1.  Go to **EC2 Dashboard** > **Security Groups**.
2.  Select the one created for your instance.
3.  **Edit Inbound rules** > Add Rule:
    - **Type**: Custom TCP
    - **Port range**: `3000` (Our backend port)
    - **Source**: `0.0.0.0/0` (Anywhere)
    - Click **Save**.

### Deploy Code
1.  **Connect** to your instance (Select instance > Click Connect > EC2 Instance Connect).
2.  **Install Docker & Docker Compose**:
    ```bash
    sudo apt update
    sudo apt install -y docker.io docker-compose
    sudo usermod -aG docker $USER
    # Re-login or use 'newgrp docker' to activate group
    ```
3.  **Clone Your Repo**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/wise-academy.git
    cd wise-academy
    ```
4.  **Setup Credentials**:
    - **Backend .env**:
      ```bash
      cd backend
      nano .env
      # Paste DATABASE_URL, GOOGLE_APPLICATION_CREDENTIALS="./service-account.json", etc.
      ```
    - **Firebase Key**:
      - Securely copy your `service-account.json` to the `backend/` directory on the server.
      - You can copy the content and paste it: `nano service-account.json`

5.  **Run with Docker Compose** (Recommended):
    ```bash
    cd .. # Go back to root
    docker-compose -f docker-compose.prod.yml up -d --build
    ```
    *This automatically builds the image and mounts the service-account.json file.*

    **OR Run Manually**:
    ```bash
    cd backend
    docker build -t wise-backend .
    docker run -d -p 3000:3000 --env-file .env -v $(pwd)/service-account.json:/app/service-account.json --restart always wise-backend
    ```
6.  **Verify**: Visit `http://YOUR_EC2_PUBLIC_IP:3000`.

---

## Part 3: Frontend Setup (AWS Amplify) ▲

1.  Search for **AWS Amplify**.
2.  Click **Create new app** > **GitHub**.
3.  Authorize AWS to access your GitHub account.
4.  **Select Repository**: `wise-academy`.
5.  **Build Settings**:
    - Amplify usually auto-detects Next.js.
    - **Monorepo**: If it asks, set the "App root" to `frontend`.
6.  **Environment Variables**:
    - Add `NEXT_PUBLIC_API_URL`.
    - Value: `http://YOUR_EC2_PUBLIC_IP:3000` (Use the IP from Part 2).
7.  Click **Save and Deploy**.
8.  ⏳ **Wait**: Amplify will build and deploy your site.
9.  **Done!** Your app is live at the `.amplifyapp.com` URL.

---

## Troubleshooting
- **Database Connection Fail**: Ensure the RDS Security Group allows Inbound traffic from `0.0.0.0/0` (or specifically your EC2 IP) on port 5432.
- **Backend Unreachable**: Ensure EC2 Security Group allows Port 3000.
