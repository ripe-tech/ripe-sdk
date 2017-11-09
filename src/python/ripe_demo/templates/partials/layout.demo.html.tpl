{% extends "partials/layout.html.tpl" %}
{% block content %}
    <ul class="operations">
        <li id="set-part">Set Part</li>
        {% if message %}
            <li id="set-message">Set Message</li>
           {% endif %}
        <li id="get-price">Get Price</li>
        <li id="get-combinations">Get Combinations</li>
    </ul>
    <div id="price" class="price"></div>
    {% if message %}
        <div class="input">
            <input type="text" id="message" placeholder="New message" />
        </div>
    {% endif %}
    {% block canvas %}
        <div id="configurator" class="configurator" data-size="620" data-sensitivity="40" data-position="0" data-view="side">
        </div>
        <div id="images" class="images">
            <img id="frame-0" data-size="200" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
            <img id="frame-6" data-size="200" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
            <img id="frame-top" data-size="200" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
        </div>
    {% endblock %}
{% endblock %}
