{% extends "partials/layout.demo.html.tpl" %}
{% block body_class %}{{ super() }} uwide{% endblock %}
{% block canvas %}
    <div id="canvas" class="canvas" data-url="{{ url|default('', True) }}"
         data-model="{{ model|default('dionysus', True) }}">
        <img id="frame-0" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
        <img id="frame-1" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
    </div>
{% endblock %}
