#!/usr/bin/python
# -*- coding: utf-8 -*-

import appier


class BaseController(appier.Controller):
    @appier.route("/", "GET")
    @appier.route("/index", "GET")
    def index(self):
        return self.redirect(self.url_for("base.simple"))

    @appier.route("/simple", "GET")
    def simple(self):
        client_id = appier.conf("OAUTH_ID", None)
        client_secret = appier.conf("OAUTH_SECRET", None)
        return self.template(
            "simple.html.tpl",
            url=self.field("url"),
            compose_url=self.field("compose_url"),
            brand=self.field("brand"),
            model=self.field("model"),
            variant=self.field("variant"),
            version=self.field("version"),
            country=self.field("country"),
            currency=self.field("currency"),
            client_id=self.field("client_id", client_id),
            client_secret=self.field("client_secret", client_secret),
            guess=self.field("guess", False, cast=bool),
            guess_url=self.field("guess_url", False, cast=bool),
            mode=self.field("mode", "full"),
        )
