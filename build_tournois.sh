#!/bin/bash

TOURNOIS_L=$(echo $TOURNOIS | sed s/,/\\n/g)
for t in $TOURNOIS_L; do
    cp -a front $t
    pushd $t
    echo VUE_APP_TOURNOI=$t>.env
    npm run build &
    popd
done

wait
