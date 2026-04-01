#!/bin/bash

# Tag: zeus-22.0.4
BITBAKE_DOCS_COMMIT=d6e45bad8e7b5bbae23307243a5e7ade147ba668
# Tag: zeus-22.0.4
YOCTO_DOCS_COMMIT=978d030e65e0540c1074479b0967d50423cc9ff0

BITBAKE_DOCS_LIST="bitbake-user-manual-metadata.rst bitbake-user-manual-ref-variables.rst"
YOCTO_DOCS_LIST=" tasks.rst variables.rst"

set -e
cd "$(dirname "$(readlink -f "$0")")/.."

mkdir -p server/resources/docs
#  Bitbake docs
git clone --depth 1 --filter=blob:none --sparse https://github.com/openembedded/bitbake.git
cd bitbake
git sparse-checkout set doc/bitbake-user-manual/
git fetch origin
git checkout $BITBAKE_DOCS_COMMIT
cd doc/bitbake-user-manual/
mv $BITBAKE_DOCS_LIST  ../../../server/resources/docs
cd ../../../
rm -rf bitbake

# Yocto docs
git clone --depth 1 --filter=blob:none --sparse https://git.yoctoproject.org/yocto-docs
cd yocto-docs
git sparse-checkout set documentation/ref-manual
git fetch origin
git checkout $YOCTO_DOCS_COMMIT
cd documentation/ref-manual
mv $YOCTO_DOCS_LIST ../../../server/resources/docs
cd ../../../
rm -rf yocto-docs

# This line is added to let the last task in tasks.rst get matched by the regex in doc scanner
echo "\n.. _ref-dummy-end-for-matching-do-validate-branches:" >> server/resources/docs/tasks.rst
