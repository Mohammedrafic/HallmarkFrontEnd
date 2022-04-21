cd /usr/share/nginx/html/assets/

echo "env variables substitution job..."
echo $API_ENDPOINT_URL
for i in $(awk 'BEGIN{for (v in ENVIRON) print v}'); do
    VAR=$(printenv $i | tr -d \")
    echo "$i $VAR"
    for j in *.js*; do
        sed -i "s,%%$i%%,$VAR,g" $j
    done
done

nginx -g "daemon off;"