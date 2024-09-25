import { Button as RBButton } from "react-bootstrap";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import styles from "./Button.module.css";

export default function Button({
  title,
  children,
  variant,
  type = "button",
  as = null,
  href = null,
  size,
  onClick,
  disabled,
}) {
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {title}
    </Tooltip>
  );

  const button = (
    <RBButton
      className={`${variant ? styles[variant] : styles.default} font-zapp`}
      type={type}
      as={as}
      href={href}
      size={size}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </RBButton>
  );

  return title ? (
    <OverlayTrigger placement="top" overlay={renderTooltip}>
      {button}
    </OverlayTrigger>
  ) : (
    button
  );
}
