NODE_OPTS :=
TEST_OPTS :=

love:
	@echo "Feel like makin' love."

test:
	@node $(NODE_OPTS) ./node_modules/.bin/_mocha -R dot $(TEST_OPTS)

spec: 
	@node $(NODE_OPTS) ./node_modules/.bin/_mocha -R spec $(TEST_OPTS)

autotest:
	@node $(NODE_OPTS) ./node_modules/.bin/_mocha -R spec --watch $(TEST_OPTS)

pack:
	npm pack

publish:
	npm publish

clean:
	rm -f *.tgz

.PHONY: love test spec autotest
.PHONY: pack publish clean
