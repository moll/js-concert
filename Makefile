NODE_OPTS :=
TEST_OPTS :=

# NOTE: Sorry, mocumentation is not yet published.
MOCUMENT = ~/Documents/Mocumentation/bin/mocument
MOCUMENT_OPTS = --type yui --title Concert.js
GITHUB_URL = https://github.com/moll/js-concert

love:
	@echo "Feel like makin' love."

test:
	@node $(NODE_OPTS) ./node_modules/.bin/mocha -R dot $(TEST_OPTS)

spec: 
	@node $(NODE_OPTS) ./node_modules/.bin/mocha -R spec $(TEST_OPTS)

autotest:
	@node $(NODE_OPTS) ./node_modules/.bin/mocha -R dot --watch $(TEST_OPTS)

autospec:
	@node $(NODE_OPTS) ./node_modules/.bin/mocha -R spec --watch $(TEST_OPTS)

pack:
	@file=$$(npm pack); echo "$$file"; tar tf "$$file"

publish:
	npm publish

tag:
	git tag "v$$(node -e 'console.log(require("./package").version)')"

doc: doc.json
	@mkdir -p doc
	@$(MOCUMENT) $(MOCUMENT_OPTS) tmp/doc/data.json > doc/API.md

toc: doc.json
	@$(MOCUMENT) $(MOCUMENT_OPTS) \
		--template toc \
		--var api_url=$(GITHUB_URL)/blob/master/doc/API.md \
		tmp/doc/data.json > tmp/TOC.md

	@echo '/^API$$/,/^License$$/{/^API$$/{r tmp/TOC.md\na\\\n\\\n\\\n\n};/^License/!d;}' |\
		sed -i "" -f /dev/stdin README.md

doc.json:
	@mkdir -p tmp
	@yuidoc --exclude test,node_modules --parse-only --outdir tmp/doc .

clean:
	rm -f *.tgz tmp

.PHONY: love
.PHONY: test spec autotest autospec
.PHONY: pack publish tag
.PHONY: clean
.PHONY: doc toc doc.json
