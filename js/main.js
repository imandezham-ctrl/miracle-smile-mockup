/* A Miracle Smile — demo mockup scripts. No network requests are made. */
(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 960px)").addEventListener("change", function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Highlight today in hours tables ---------- */
  var today = new Date().getDay(); // 0 = Sunday
  document.querySelectorAll(".hours-table tr[data-day]").forEach(function (row) {
    var days = row.getAttribute("data-day").split(",").map(Number);
    if (days.indexOf(today) !== -1) row.classList.add("is-today");
  });

  /* ---------- Booking form ---------- */
  var form = document.getElementById("booking-form");
  if (!form) return;

  var confirmation = document.getElementById("confirmation");
  var summary = document.getElementById("form-summary");
  var dateInput = form.elements["date"];

  // Earliest selectable date is tomorrow (local time).
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var toISO = function (d) {
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  };
  dateInput.min = toISO(tomorrow);

  // Allow ?service=<value> to preselect a service (used by "Book this" links).
  var params = new URLSearchParams(window.location.search);
  var preset = params.get("service");
  if (preset) {
    var opt = form.elements["service"].querySelector('option[value="' + CSS.escape(preset) + '"]');
    if (opt) opt.selected = true;
  }

  var parseDate = function (value) {
    var p = value.split("-").map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  };

  var validators = {
    name: function (v) {
      v = v.trim();
      if (!v) return "Please enter your full name.";
      if (v.length < 2) return "Name looks too short.";
      return "";
    },
    phone: function (v) {
      var digits = v.replace(/\D/g, "");
      if (!digits) return "Please enter a phone number.";
      if (digits.length === 11 && digits.charAt(0) === "1") digits = digits.slice(1);
      if (digits.length !== 10) return "Enter a 10-digit U.S. phone number, e.g. (916) 555-0123.";
      return "";
    },
    email: function (v) {
      v = v.trim();
      if (!v) return "Please enter your email address.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email, e.g. name@example.com.";
      return "";
    },
    date: function (v) {
      if (!v) return "Please choose a preferred date.";
      var d = parseDate(v);
      if (isNaN(d.getTime())) return "Please choose a valid date.";
      if (d < parseDate(toISO(tomorrow))) return "Please choose a date from tomorrow onward.";
      var day = d.getDay();
      if (day === 0 || day === 6) return "The office is closed on weekends. Please pick Monday–Friday.";
      return "";
    },
    time: function () {
      return form.querySelector('input[name="time"]:checked') ? "" : "Please choose a preferred time of day.";
    },
    service: function (v) {
      return v ? "" : "Please select a service.";
    },
    message: function (v) {
      return v.length > 1000 ? "Please keep your message under 1,000 characters." : "";
    }
  };

  var fieldWrap = function (name) {
    return form.querySelector('[data-field="' + name + '"]');
  };

  var showError = function (name, msg) {
    var wrap = fieldWrap(name);
    if (!wrap) return;
    var errEl = wrap.querySelector(".field-error span");
    var controls = name === "time"
      ? form.querySelectorAll('input[name="time"]')
      : [form.elements[name]];
    wrap.classList.toggle("has-error", !!msg);
    if (errEl) errEl.textContent = msg;
    Array.prototype.forEach.call(controls, function (c) {
      if (msg) c.setAttribute("aria-invalid", "true");
      else c.removeAttribute("aria-invalid");
    });
  };

  var getValue = function (name) {
    if (name === "time") return "";
    return form.elements[name].value;
  };

  var validateField = function (name) {
    var msg = validators[name](getValue(name));
    showError(name, msg);
    return msg;
  };

  // Validate on blur once a field has been touched, and clear errors as the user fixes them.
  Object.keys(validators).forEach(function (name) {
    if (name === "time") {
      form.querySelectorAll('input[name="time"]').forEach(function (r) {
        r.addEventListener("change", function () { validateField("time"); });
      });
      return;
    }
    var el = form.elements[name];
    el.addEventListener("blur", function () {
      if (el.value || fieldWrap(name).classList.contains("has-error")) validateField(name);
    });
    el.addEventListener("input", function () {
      if (fieldWrap(name).classList.contains("has-error")) validateField(name);
    });
    el.addEventListener("change", function () {
      if (fieldWrap(name).classList.contains("has-error")) validateField(name);
    });
  });

  // Light phone formatting as the user types: (916) 555-0123
  form.elements["phone"].addEventListener("input", function (e) {
    var el = e.target;
    var d = el.value.replace(/\D/g, "");
    if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
    if (d.length > 10) return;
    if (d.length >= 7) el.value = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
    else if (d.length >= 4) el.value = "(" + d.slice(0, 3) + ") " + d.slice(3);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Demo only: nothing is ever sent anywhere.

    var errors = [];
    Object.keys(validators).forEach(function (name) {
      var msg = validateField(name);
      if (msg) errors.push(name);
    });

    if (errors.length) {
      summary.textContent = "Please fix " + errors.length +
        (errors.length === 1 ? " field" : " fields") + " highlighted below.";
      summary.classList.add("is-visible");
      summary.focus();
      var first = errors[0] === "time"
        ? form.querySelector('input[name="time"]')
        : form.elements[errors[0]];
      setTimeout(function () { first.focus(); }, 50);
      return;
    }

    summary.classList.remove("is-visible");

    // Fill the confirmation summary (textContent only — no HTML injection).
    var serviceSel = form.elements["service"];
    var time = form.querySelector('input[name="time"]:checked');
    var d = parseDate(form.elements["date"].value);
    var fill = function (key, value) {
      var el = confirmation.querySelector('[data-confirm="' + key + '"]');
      if (el) el.textContent = value;
    };
    fill("name", form.elements["name"].value.trim());
    fill("service", serviceSel.options[serviceSel.selectedIndex].text);
    fill("date", d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }));
    fill("time", time.parentElement.textContent.trim());
    fill("contact", form.elements["phone"].value + " · " + form.elements["email"].value.trim());

    form.hidden = true;
    confirmation.hidden = false;
    confirmation.focus();
    confirmation.scrollIntoView({ block: "start" });
  });

  document.getElementById("new-request").addEventListener("click", function () {
    form.reset();
    Object.keys(validators).forEach(function (name) { showError(name, ""); });
    confirmation.hidden = true;
    form.hidden = false;
    form.elements["name"].focus();
  });
})();
