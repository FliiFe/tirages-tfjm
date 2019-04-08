#!/bin/bash

pushd back
TOURNOIS_L=$(echo $TOURNOIS | sed s/,/\\n/g)
INITIAL_PORT=8080
I=1
for t in $TOURNOIS_L; do
    echo "Launching instance for $t on port $((INITIAL_PORT + I))"
    node dist/index.js $((INITIAL_PORT + I)) $t &
    I=$((I + 1))
done

popd

cd dispatcher
node index.js

wait
