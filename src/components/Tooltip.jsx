import { cloneElement, useId } from "react";

const Tooltip = ({ title, content, children }) => {
  const tooltipId = useId();

  return (
    <span className="relative inline-flex group/tooltip">
      {cloneElement(children, { "aria-describedby": tooltipId })}
      <span
        id={tooltipId}
        role="tooltip"
        className="absolute bottom-full left-1/2 -translate-x-1/2 translate-y-1 mb-3 z-20 w-max max-w-[16rem] opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:translate-y-0 transition-all duration-300"
      >
        <span className="relative block overflow-hidden bg-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl shadow-primary-500/10 px-4 py-3 text-left">
          <span className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-primary-400 to-purple-400"></span>
          {title && (
            <span className="block text-sm font-bold text-white mb-1">
              {title}
            </span>
          )}
          <span className="block text-xs text-gray-300 leading-relaxed">
            {content}
          </span>
        </span>
        <span className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-gray-800 border-r border-b border-gray-700"></span>
      </span>
    </span>
  );
};

export default Tooltip;
