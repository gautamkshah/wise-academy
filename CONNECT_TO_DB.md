# How to View Your AWS Database (RDS)

Since you successfully deployed your project, your database is hosted on AWS RDS. To view and manage the data (tables, rows, etc.), you need a database client.

## Recommended Tool: DBeaver
**DBeaver** is a free, universal database tool that is easy to use.
1.  **Download & Install**: [https://dbeaver.io/download/](https://dbeaver.io/download/)
    *   *Alternative*: **pgAdmin** is also very common for PostgreSQL.

## Connection Details
Use these credentials found in your project configuration:

| Setting | Value |
| :--- | :--- |
| **Host / Endpoint** | `wise-db.c9ogoq40ewt7.ap-south-1.rds.amazonaws.com` |
| **Port** | `5432` |
| **Database** | `postgres` |
| **Username** | `postgres` |
| **Password** | `WiseAcademy2026!` |

## Steps to Connect
1.  Open **DBeaver**.
2.  Click the **"New Database Connection"** icon (plug with a plus sign).
3.  Select **PostgreSQL** and click **Next**.
4.  Fill in the details from the table above:
    *   **Host**: Paste the Host endpoint.
    *   **Database**: `postgres`
    *   **Username**: `postgres`
    *   **Password**: Paste the password.
5.  Click **Test Connection** (bottom left).
    *   **Success**: Click **Finish**.
    *   **Fail / Timeout**: See Troubleshooting below.

## Troubleshooting: Connection Timed Out
If the connection "Times Out", your computer's IP address often needs specific permission to access the RDS instance, even if you set it to Public previously (IPs change).

**Fix:**
1.  Go to the **AWS Console > RDS > Databases**.
2.  Click on `wise-db`.
3.  Under **Connectivity & security**, click the link under **VPC security groups** (e.g., `rds-sg`).
4.  Select the security group (checkbox).
5.  Click the **Inbound rules** tab -> **Edit inbound rules**.
6.  **Add rule** (if valid one is missing):
    *   **Type**: PostgreSQL (TCP 5432)
    *   **Source**: Select **My IP** (this auto-fills your current IP).
7.  Click **Save rules**.
8.  Try connecting again in DBeaver.

## Viewing Data
Once connected:
1.  Expand the connection in the left sidebar.
2.  Go to **Databases** > **postgres** > **Schemas** > **public** > **Tables**.
3.  Right-click on a table (e.g., `User`) and select **View Data**.
