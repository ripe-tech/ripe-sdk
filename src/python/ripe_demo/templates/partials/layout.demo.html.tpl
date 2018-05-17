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
        <div class="initials-container">
            <img id="initials" class="initials" data-width="500" data-height="500" />
            <input id="initials-text" name="initials-text" type="text" class="text-field"
                   placeholder="Set initials" value="" />
            <ul id="initials-drop" name="initials-drop" class="drop-down"
                data-name="Select profile" data-input="profile">
                <li data-value="default">
                    <span>Default</span>
                </li>
            </ul>
        </div>
    {% endblock %}
{% endblock %}
