#!/usr/bin/python
# -*- coding: utf-8 -*-

import appier

class BaseController(appier.Controller):

    @appier.route("/", "GET")
    @appier.route("/index", "GET")
    def index(self):
        return self.redirect(
            self.url_for("base.simple")
        )

    @appier.route("/simple", "GET")
    def simple(self):
        return self.template(
            "simple.html.tpl",
            url = self.field("url"),
            brand = self.field("brand"),
            model = self.field("model"),
            variant = self.field("variant"),
            country = self.field("country"),
            currency = self.field("currency")
        )

    @appier.route("/gucci", "GET")
    def gucci(self):
        return self.template(
            "gucci.html.tpl",
            url = self.field("url"),
            brand = self.field("brand"),
            model = self.field("model"),
            variant = self.field("variant"),
            country = self.field("country"),
            currency = self.field("currency")
        )
