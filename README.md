To run: 
1. Clone this repository and https://github.com/meio-velarde/stack-image-service
2. Follow the backend instructions and make sure an S3 bucket is connected to the service. For now, I also recommend setting a policy for the S3 bucket for all additions to be set for public consumption. A MySQL database set up is also needed.
3. Serve the backend application via `php artisan serve` in the root directory
4. Serve this application via `ng serve` in the root directory 
5. Paste the following in a fresh `environments/environment.ts` file:

```
export const environment = {
  production: false,
  API_IMAGES_RESOURCE: 'http://localhost:8000/api/images'
};
```
