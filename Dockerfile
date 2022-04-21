# Use official nginx image as the base image
FROM nginx:latest

# Configure nginx
# RUN rm -rf /usr/share/nginx/html/* && rm -rf /etc/nginx/nginx.conf
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./run.sh ./run.sh

# Copy the build output to replace the default nginx contents.
COPY ./dist/einstein-ui /usr/share/nginx/html

# Expose port 80
EXPOSE 80
CMD chmod +x run.sh && ./run.sh