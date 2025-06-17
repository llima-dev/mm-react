import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';

import "./SortableChecklistItem.css";

type Props = {
  id: string;
  children: ReactNode;
};

export default function SortableChecklistItem({ id, children }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'manipulation',
    display: 'flex',
    alignItems: 'baseline', 
    justifyContent: 'space-between'
  };

  return (
    <div ref={setNodeRef} style={style} className='container-checklist'>
      {children}
      <span {...attributes} {...listeners} className="drag-icon">
        <FontAwesomeIcon icon={faGripVertical} />
      </span>
    </div>
  );
}
