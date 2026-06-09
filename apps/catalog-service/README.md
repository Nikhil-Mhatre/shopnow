# **Catalog Microservice**

A high-performance, read-optimized Catalog Microservice built inside a monorepo architecture with NestJS/Express, MongoDB, and RabbitMQ. This service is engineered for rapid search execution, extreme schema elasticity using the **Attribute Pattern**, stateless scaling, and asynchronous inventory synchronization (CQRS-Lite).

## **🚀 Architectural Blueprint**

* **Read-Optimized Asymmetry:** Operates with unhydrated, plain JSON resource delivery (.lean()) and **Compound Multikey Indexes** to guarantee under **5ms** read lookups without needing a full-blown Elasticsearch cluster.  
* **CQRS-Lite Decoupling:** Isolates transaction-heavy stock mutations from the browsing catalog via a background AMQP consumer loop.  
* **Asymmetric Cloud Media Uploads:** Generates secure, write-only Azure Blob Shared Access Signatures (SAS) valid for 10 minutes to prevent server-side resource exhaustion.

## **🛠️ Prerequisites & Local Setup**

Make sure you have [Docker](https://www.docker.com/) and [pnpm](https://pnpm.io/) installed locally.

### **1\. Environment Variable Configuration**

Create a .env file inside your apps/catalog-service directory:

PORT=3001  
NODE\_ENV=development

\# MongoDB Connection  
MONGO\_URI=mongodb://localhost:27017/ecommerce-catalog

\# Message Broker  
AMQP\_URL=amqp://localhost:5672

\# Azure Blob Storage Configuration (For SAS URL generation)  
AZURE\_STORAGE\_ACCOUNT\_NAME=your\_storage\_account\_name  
AZURE\_STORAGE\_ACCOUNT\_KEY=your\_base64\_encoded\_storage\_key

### **2\. Run Infrastructure Container Stack**

Boot up MongoDB, RabbitMQ, and the Envoy Proxy Gateway from your root directory:

```
docker compose up -d --build
```
## **📥 Database Seeding (Dynamic Image Injection)**

This service includes a smart self-fetching database seeder script. Instead of requiring local files, it:

1. Connects to your database and flushes previous records.  
2. Interacts with public stock photo APIs to fetch high-resolution, context-relevant tech product images.  
3. Automatically uploads those binary streams directly into your Azure Blob container using your .env credentials.  
4. Builds the public URL signatures and populates MongoDB with complete, ready-to-test product profiles.

### **Run the Seeder:**

From your root or catalog-service workspace:

pnpm \--filter catalog-service seed:catalog

## **🛰️ API Testing with Postman**

Import the provided Postman collection JSON (catalog-service.postman\_collection.json) into your Postman Workspace to test our standard and administrative APIs.

### **The Asymmetric Media Handshake (Step-by-Step Test)**

Due to Azure's security model, a multi-stage flow is executed for uploading images without overloading the node server:

 \[ Postman / FrontEnd \] ──── 1\. POST Request SAS ───► \[ Catalog Service \]  
          ▲                                                   │  
          │ (Captured by Postman Script)                      ▼ (Generates 10-Min Token)  
          ├──────────────── 2\. Returns SAS Put URL ───────────┤  
          │  
          ├──── 3\. PUT Binary Payload directly to Azure ─────► \[ Azure Blob Storage \]  
          │  
          └──── 4\. POST Complete Product metadata ───────────► \[ Catalog Service \]

1. **Step 1: Request SAS Media Token**  
   * **Endpoint:** POST {{baseUrl}}/catalog/admin/media-upload  
   * **Required Headers:** X-User-Role: admin, Content-Type: application/json  
   * **JSON Body:** {"contentType": "image/webp"}  
   * *Postman Script Automation:* Postman automatically parses the response and writes the dynamic SAS URL to collection variables: {{azureUploadUrl}} and {{azurePublicAssetUrl}}.  
2. **Step 2: Upload Image to Azure Storage**  
   * **Endpoint:** {{azureUploadUrl}} (Automatically resolved)  
   * **Method:** **PUT** *(Required by Azure \- using POST causes a 405\)*  
   * **Headers:** x-ms-blob-type: BlockBlob, Content-Type: image/webp  
   * **Body:** Select binary / file and choose any local test image file. Click **Send**\! You will receive a 201 Created directly from Azure's storage plane.  
3. **Step 3: Ingest the Product Entry**  
   * **Endpoint:** POST {{baseUrl}}/catalog/admin/products  
   * **Required Headers:** X-User-Role: admin  
   * **JSON Body:** Your body will reference {{azurePublicAssetUrl}} inside the images array so that your database stores the verified cloud-stored asset link\!

## **🤖 Testing CQRS-Lite with RabbitMQ Dashboard**

When a payment checkout or stock replenishment occurs, other microservices (like the Order/Inventory services) publish events to RabbitMQ instead of querying the Catalog directly.

You can visually monitor and trigger these events manually:

### **1\. Open the RabbitMQ Management Console**

* **URL:** [http://localhost:15672](http://localhost:15672)  
* **Default Credentials:**  
  * **Username:** guest  
  * **Password:** guest

### **2\. Verify Consumer Connection**

Go to the **Queues** tab and locate catalog-inventory-sync-queue. Ensure that:

* The queue status is Idle or Running.  
* The **Consumer count** reads 1 (This indicates your active Express background daemon has bound correctly).

### **3\. Publish a Mock Stock Event**

To simulate the Order Service reporting that a product has run out of stock:

1. Click on the queue name catalog-inventory-sync-queue.  
2. Scroll down to the **Publish message** block.  
3. Configure these exact fields:  
   * **Routing key:** inventory.product.depleted  
   * **Delivery mode:** 2 \- Persistent  
   * **Payload:** (Input the matching JSON tracking your target product SKU)  
     {"sku": "AUDIO-HDST-ELITE26"}

4. Click **Publish message**.

### **4\. Observe Synchronization**

* Check your Catalog Service terminal logs. You will immediately see:  
  \[Sync\] Product AUDIO-HDST-ELITE26 marked OUT of stock.

* Run the search/homepage queries in Postman; that product is now automatically excluded from the public display lists\!  
* Publish a message with Routing Key inventory.product.replenished to immediately flip its status back and make it browsable.