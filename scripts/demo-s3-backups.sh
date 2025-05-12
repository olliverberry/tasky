#!/bin/bash

S3_BUCKET_URL=${1}
RES=$(curl -s $S3_BUCKET_URL)
echo $RES
