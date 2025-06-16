import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { cloneElement } from 'react';

type Props = {
  id: string;
  children: ReactElement<{ dragHandle?: React.ReactNode }>;
};

export default function SortableItem({ id, children }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'manipulation',
  };

  const dragHandle = (
    <span {...attributes} {...listeners} style={{ cursor: 'grab' }}>
      <FontAwesomeIcon icon={faGripVertical} />
    </span>
  );

  const enhancedChild = cloneElement(children, { dragHandle });

  return (
    <div ref={setNodeRef} style={style}>
      {enhancedChild}
    </div>
  );
}
