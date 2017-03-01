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
        <div id="canvas" class="canvas" data-url="{{ url|default('', True) }}"
             data-model="{{ model|default('', True) }}">
            <img id="frame-0" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
            <img id="frame-6" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
            <img id="frame-top" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
        </div>
    {% endblock %}
{% endblock %}
