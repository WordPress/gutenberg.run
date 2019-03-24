#!/bin/bash

find /src/trees ! -path /src/trees -type d -maxdepth 1 -exec rm -rf {} +
