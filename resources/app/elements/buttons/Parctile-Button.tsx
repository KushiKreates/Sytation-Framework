import React, { useRef, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface ParticleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof particleButtonVariants> {
  children: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

const particleButtonVariants = cva(
  "relative inline-block font-semibold leading-6 text-white cursor-pointer rounded-xl transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95 group"
);

function ParticleButton({
  children,
  showIcon = true,
  className,
  onClick,
  ...props
}: ParticleButtonProps) {
  // Reference to the button element for positioning particles
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Create particles effect when button is clicked
  const createParticles = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    // Get button position and dimensions
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Number of particles to create
    const particleCount = 20;
    
    // Particle colors from the gradient
    const colors = ['#2dd4bf', '#3b82f6', '#a855f7'];

    for (let i = 0; i < particleCount; i++) {
      createParticle(x, y, colors[Math.floor(Math.random() * colors.length)], rect);
    }

    // Call the original onClick handler if provided
    if (onClick) onClick(event);
  }, [onClick]);

  // Function to create a single particle
  const createParticle = (x: number, y: number, color: string, rect: DOMRect) => {
    const particle = document.createElement('div');
    document.body.appendChild(particle);

    // Set particle styles
    particle.style.position = 'fixed';
    particle.style.left = (rect.left + x) + 'px';
    particle.style.top = (rect.top + y) + 'px';
    particle.style.width = '8px';
    particle.style.height = '8px';
    particle.style.borderRadius = '50%';
    particle.style.backgroundColor = color;
    particle.style.pointerEvents = 'none';
    particle.style.opacity = '1';
    particle.style.zIndex = '1000';

    // Random particle movement
    const destinationX = (rect.left + x) + (Math.random() - 0.5) * 2 * 100;
    const destinationY = (rect.top + y) + (Math.random() - 0.5) * 2 * 100;
    const rotation = Math.random() * 520;
    const scale = Math.random() * 0.8 + 0.2;
    const duration = Math.random() * 1000 + 500;

    // Animate the particle
    particle.animate([
      {
        transform: 'translate(0px, 0px) rotate(0deg) scale(1)',
        opacity: 1
      },
      {
        transform: `translate(${destinationX - (rect.left + x)}px, ${destinationY - (rect.top + y)}px) rotate(${rotation}deg) scale(${scale})`,
        opacity: 0
      }
    ], {
      duration: duration,
      easing: 'cubic-bezier(0, .9, .57, 1)',
      fill: 'forwards'
    }).onfinish = () => {
      particle.remove();
    };
  };

  return (
    <button
      ref={buttonRef}
      className={cn(particleButtonVariants(), className)}
      onClick={createParticles}
      {...props}
    >
      

      {/* Button content */}
      <span className="relative z-10 block px-6 py-3 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 dark:bg-zinc-200 dark:hover:bg-zinc-400 dark:text-black ">
        <div className="relative z-10 flex items-center space-x-2">
          <span className="transition-all duration-500 group-hover:translate-x-1">
            {children}
          </span>
          {showIcon && (
            <ChevronRight 
              className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1" 
            />
          )}
        </div>
      </span>
    </button>
  );
}

export { ParticleButton };