# AWS Hosting Guide (Single EC2)

This guide walks you through deploying the Wise Academy application on a single AWS EC2 instance using Docker Compose.

## Prerequisites

1.  **AWS Account**: You need an active AWS account.
2.  **Domain Name (Optional)**: If you want a custom domain (e.g., `wiseacademy.com`).

---

## Step 1: Launch an EC2 Instance 🚀

1.  **Log in to AWS Console** and search for **EC2**.
2.  Click **Launch Instance**.
3.  **Name**: `wise-academy-server`
4.  **OS Image**: **Ubuntu Server 24.04 LTS** (Free tier eligible).
5.  **Instance Type**: `t2.micro` (Free tier) or `t3.small` (Recommended for better performance).
6.  **Key Pair**: Create a new key pair (e.g., `wise-key`), download the `.pem` file, and keep it safe.
7.  **Network Settings**:
    -   Check **Allow HTTPS traffic from the internet**.
    -   Check **Allow HTTP traffic from the internet**.
8.  Click **Launch Instance**.

---

## Step 2: Set up Security Group 🛡️

1.  Go to **EC2 Dashboard** > **Security Groups**.
2.  Select the Security Group attached to your new instance.
3.  Click **Edit inbound rules**.
4.  Ensure the following ports are open:
    -   **SSH (22)**: My IP (for security).
    -   **HTTP (80)**: Anywhere (0.0.0.0/0).
    -   **HTTPS (443)**: Anywhere (0.0.0.0/0).
    -   *(Optional)* **Custom TCP (3000)**: Anywhere (If you want to access backend directly for debugging).

---

## Step 3: Connect & Install Docker 🐳

1.  Open your terminal and navigate to where your key pair (`.pem`) file is.
2.  Set permissions: `chmod 400 wise-key.pem`
3.  Connect via SSH:
    ```bash
    ssh -i "wise-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
    ```
4.  **Install Docker & Compose**:
    ```bash
    # Update packages
    sudo apt update
    sudo apt upgrade -y

    # Install Docker
    sudo apt install -y docker.io

    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker

    # Add user to docker group (avoids using sudo for docker commands)
    sudo usermod -aG docker $USER
    
    # Check if docker-compose is installed (newer docker versions include it as 'docker compose')
    docker compose version
    ```
5.  **Log out and log back in** for group changes to take effect.

---

## Step 4: Deploy the Application 📦

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/YOUR_GITHUB_USERNAME/wise-academy-main.git
    cd wise-academy-main
    ```

2.  **Create Environment File**:
    ```bash
    nano .env
    ```
    Paste the following (update with your actual values):
    ```env
    DB_USER=postgres
    DB_PASSWORD=secure_password
    DB_NAME=wise_db
    JWT_SECRET=complex_secret_key
    EC2_PUBLIC_IP=YOUR_EC2_PUBLIC_IP
    ```
    *Note: If using AWS RDS, update the `DATABASE_URL` in `docker-compose.prod.yml`.*

3.  **Start the Application**:
    ```bash
    docker compose -f docker-compose.prod.yml up -d --build
    ```

4.  **Verify**:
    -   Open your browser and visit `http://YOUR_EC2_PUBLIC_IP`.
    -   You should see the application running!

---

## Step 5: Database Persistence (Important!) 💾

By default, the database is running inside a Docker container.
-   **Risk**: If you delete the container volume, you lose data.
-   **Production Recommendation**: Use **AWS RDS**.
    1.  Create a PostgreSQL database in AWS RDS (Free Tier available).
    2.  Update `docker-compose.prod.yml`:
        -   Remove the `db` service.
        -   Update `backend` environment variable `DATABASE_URL` to point to your RDS endpoint.

---

## Step 6: SSL (HTTPS) with Certbot 🔒

To enable HTTPS (Green lock in browser):

1.  Install Certbot:
    ```bash
    sudo apt install -y certbot python3-certbot-nginx
    ```
2.  Update Nginx config to use your domain name (in `docker/nginx/default.conf`).
3.  Run Certbot (Note: Requires a real domain name pointed to your IP):
    ```bash
    sudo certbot --nginx -d wiseacademy.com
    ```
