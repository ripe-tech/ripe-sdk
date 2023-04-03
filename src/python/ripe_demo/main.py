#!/usr/bin/python
# -*- coding: utf-8 -*-

import appier


class RipeDemoApp(appier.WebApp):
    """
    The main app class for the Ripe Demo instance
    should configure the instance main points.
    """

    def __init__(self, *args, **kwargs):
        appier.WebApp.__init__(self, name="ripe_demo", *args, **kwargs)


if __name__ == "__main__":
    app = RipeDemoApp()
    app.serve()
else:
    __path__ = []
