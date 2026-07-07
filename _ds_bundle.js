/* @ds-bundle: {"format":4,"namespace":"CTArtisanalPantryDesignSystem_9788c3","components":[{"name":"ProductCard","sourcePath":"components/commerce/ProductCard.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"SectionEyebrow","sourcePath":"components/core/SectionEyebrow.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"}],"sourceHashes":{"components/commerce/ProductCard.jsx":"69c5f8d061f0","components/core/Badge.jsx":"7124925a0de6","components/core/Button.jsx":"4832f0091ecf","components/core/Card.jsx":"021774cf9475","components/core/SectionEyebrow.jsx":"20382c629429","components/forms/Input.jsx":"fb54911715be"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CTArtisanalPantryDesignSystem_9788c3 = window.CTArtisanalPantryDesignSystem_9788c3 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/commerce/ProductCard.jsx
try { (() => {
function ProductCard({
  image,
  title,
  descriptor,
  imageAlt = ""
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "1 / 1",
      background: image ? `center / cover no-repeat url(${image})` : "var(--surface-muted)",
      borderRadius: "var(--radius-md)"
    },
    role: "img",
    "aria-label": imageAlt
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "6px"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: "var(--text-h3)",
      color: "var(--text-primary)",
      margin: 0
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--text-body-sm)",
      color: "var(--text-muted)",
      margin: 0
    }
  }, descriptor)));
}
Object.assign(__ds_scope, { ProductCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/ProductCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function Badge({
  children,
  tone = "neutral"
}) {
  const tones = {
    neutral: {
      background: "var(--surface-muted)",
      color: "var(--text-secondary)"
    },
    accent: {
      background: "var(--accent-soft)",
      color: "var(--accent-hover)"
    },
    inverse: {
      background: "var(--surface-inverse)",
      color: "var(--text-on-inverse)"
    }
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      fontFamily: "var(--font-sans-body)",
      fontSize: "11px",
      fontWeight: "var(--fw-medium)",
      letterSpacing: "var(--ls-wide)",
      textTransform: "uppercase",
      padding: "5px 12px",
      borderRadius: "var(--radius-pill)",
      ...tones[tone]
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const PADDING = {
  sm: "10px 20px",
  md: "14px 28px",
  lg: "16px 36px"
};
const FONT_SIZE = {
  sm: "var(--fs-label)",
  md: "var(--fs-body-sm)",
  lg: "var(--fs-body)"
};
function variantStyle(variant) {
  switch (variant) {
    case "primary":
      return {
        background: "var(--accent)",
        color: "var(--text-on-accent)",
        border: "1px solid var(--accent)"
      };
    case "outline":
      return {
        background: "transparent",
        color: "var(--text-primary)",
        border: "1px solid var(--text-primary)"
      };
    case "inverse":
      return {
        background: "var(--surface-page)",
        color: "var(--text-primary)",
        border: "1px solid var(--surface-page)"
      };
    case "text":
    default:
      return {
        background: "transparent",
        color: "var(--text-primary)",
        border: "none",
        padding: 0,
        textUnderlineOffset: "6px"
      };
  }
}
function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  as = "button",
  href,
  onClick,
  style
}) {
  const vStyle = variantStyle(variant);
  const isText = variant === "text";
  const Tag = as === "a" ? "a" : "button";
  const base = {
    fontFamily: "var(--font-sans-body)",
    fontSize: FONT_SIZE[size],
    letterSpacing: "var(--ls-wide)",
    textTransform: "uppercase",
    fontWeight: "var(--fw-medium)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderRadius: "var(--radius-pill)",
    transition: "background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)",
    textDecoration: isText ? "underline" : "none",
    padding: isText ? 0 : PADDING[size],
    ...vStyle,
    ...style
  };
  return /*#__PURE__*/React.createElement(Tag, {
    href: as === "a" ? href : undefined,
    disabled: as === "button" ? disabled : undefined,
    onClick: disabled ? undefined : onClick,
    style: base,
    onMouseEnter: e => {
      if (disabled) return;
      if (variant === "primary") e.currentTarget.style.background = "var(--accent-hover)";
      if (variant === "outline") {
        e.currentTarget.style.background = "var(--text-primary)";
        e.currentTarget.style.color = "var(--surface-page)";
      }
      if (variant === "text") e.currentTarget.style.color = "var(--accent)";
    },
    onMouseLeave: e => {
      if (disabled) return;
      if (variant === "primary") e.currentTarget.style.background = "var(--accent)";
      if (variant === "outline") {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--text-primary)";
      }
      if (variant === "text") e.currentTarget.style.color = "var(--text-primary)";
    }
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function Card({
  children,
  padding = "var(--space-6)",
  style,
  elevated = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-card)",
      border: elevated ? "none" : "1px solid var(--border-subtle)",
      boxShadow: elevated ? "var(--shadow-md)" : "none",
      borderRadius: "var(--radius-lg)",
      padding,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionEyebrow.jsx
try { (() => {
function SectionEyebrow({
  children,
  tone = "default",
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans-body)",
      fontSize: "var(--fs-label)",
      fontWeight: "var(--fw-medium)",
      letterSpacing: "var(--ls-wider)",
      textTransform: "uppercase",
      color: tone === "accent" ? "var(--accent)" : "var(--text-muted)",
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { SectionEyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionEyebrow.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("input", {
    type: type,
    placeholder: placeholder,
    value: value,
    onChange: onChange,
    style: {
      fontFamily: "var(--font-sans-body)",
      fontSize: "var(--fs-body)",
      color: "var(--text-primary)",
      background: "var(--surface-card)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-md)",
      padding: "14px 18px",
      width: "100%",
      boxSizing: "border-box",
      outline: "none",
      transition: "border-color var(--duration-fast) var(--ease-standard)",
      ...style
    },
    onFocus: e => e.currentTarget.style.borderColor = "var(--text-primary)",
    onBlur: e => e.currentTarget.style.borderColor = "var(--border-default)"
  });
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

__ds_ns.ProductCard = __ds_scope.ProductCard;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.SectionEyebrow = __ds_scope.SectionEyebrow;

__ds_ns.Input = __ds_scope.Input;

})();
