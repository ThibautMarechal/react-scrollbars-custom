import { cnb } from 'cnbuilder';
import * as React from 'react';
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable';
import { AXIS_DIRECTION, ElementPropsWithElementRefAndRenderer } from './types';
import { isBrowser, isUndef, mergeRefs, renderDivWithRenderer } from './util';

export type DragCallbackData = Pick<DraggableData, Exclude<keyof DraggableData, 'node'>>;

export type ScrollbarThumbProps = ElementPropsWithElementRefAndRenderer & {
  axis: AXIS_DIRECTION;

  onDrag?: (data: DragCallbackData) => void;
  onDragStart?: (data: DragCallbackData) => void;
  onDragEnd?: (data: DragCallbackData) => void;

  ref?: (ref: ScrollbarThumb | null) => void;
};

export default class ScrollbarThumb extends React.Component<ScrollbarThumbProps, unknown> {
  private static selectStartReplacer = () => false;

  public initialOffsetX = 0;

  public initialOffsetY = 0;

  private prevUserSelect: string;

  private prevOnSelectStart: ((ev: Event) => boolean) | null;

  private elementRef = React.createRef<HTMLElement>();

  public lastDragData: DragCallbackData = {
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    lastX: 0,
    lastY: 0,
  };

  public componentDidMount(): void {
    if (!this.elementRef.current) {
      this.setState(() => {
        throw new Error(
          "<ScrollbarThumb> Element was not created. Possibly you haven't provided HTMLDivElement to renderer's `elementRef` function."
        );
      });
    }
  }

  public componentWillUnmount(): void {
    this.handleOnDragStop();
  }

  public handleOnDragStart = (ev: DraggableEvent, data: DraggableData) => {
    if (!this.elementRef.current) {
      this.handleOnDragStop(ev, data);
      return;
    }

    if (isBrowser) {
      this.prevUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = 'none';

      this.prevOnSelectStart = document.onselectstart;
      document.addEventListener('selectstart', ScrollbarThumb.selectStartReplacer);
    }

    if (this.props.onDragStart) {
      this.props.onDragStart(
        (this.lastDragData = {
          x: data.x - this.initialOffsetX,
          y: data.y - this.initialOffsetY,
          lastX: data.lastX - this.initialOffsetX,
          lastY: data.lastY - this.initialOffsetY,
          deltaX: data.deltaX,
          deltaY: data.deltaY,
        })
      );
    }

    this.elementRef.current.classList.add('dragging');
  };

  public handleOnDrag = (ev: DraggableEvent, data: DraggableData) => {
    if (!this.elementRef.current) {
      this.handleOnDragStop(ev, data);
      return;
    }

    if (this.props.onDrag) {
      this.props.onDrag(
        (this.lastDragData = {
          x: data.x - this.initialOffsetX,
          y: data.y - this.initialOffsetY,
          lastX: data.lastX - this.initialOffsetX,
          lastY: data.lastY - this.initialOffsetY,
          deltaX: data.deltaX,
          deltaY: data.deltaY,
        })
      );
    }
  };

  public handleOnDragStop = (ev?: DraggableEvent, data?: DraggableData) => {
    const resultData = data
      ? {
          x: data.x - this.initialOffsetX,
          y: data.y - this.initialOffsetY,
          lastX: data.lastX - this.initialOffsetX,
          lastY: data.lastY - this.initialOffsetY,
          deltaX: data.deltaX,
          deltaY: data.deltaY,
        }
      : this.lastDragData;

    if (this.props.onDragEnd) this.props.onDragEnd(resultData);

    if (this.elementRef.current) this.elementRef.current.classList.remove('dragging');

    if (isBrowser) {
      document.body.style.userSelect = this.prevUserSelect;

      if (this.prevOnSelectStart) {
        document.addEventListener('selectstart', this.prevOnSelectStart);
      }

      this.prevOnSelectStart = null;
    }

    this.initialOffsetX = 0;
    this.initialOffsetY = 0;
    this.lastDragData = {
      x: 0,
      y: 0,
      deltaX: 0,
      deltaY: 0,
      lastX: 0,
      lastY: 0,
    };
  };

  public handleOnMouseDown = (ev: MouseEvent) => {
    if (!this.elementRef.current) {
      return;
    }

    ev.preventDefault();
    ev.stopPropagation();

    if (!isUndef(ev.offsetX)) {
      /* istanbul ignore next */
      this.initialOffsetX = ev.offsetX;
      /* istanbul ignore next */
      this.initialOffsetY = ev.offsetY;
    } else {
      const rect = this.elementRef.current.getBoundingClientRect();
      this.initialOffsetX =
        (ev.clientX || (ev as unknown as TouchEvent).touches[0].clientX) - rect.left;
      this.initialOffsetY =
        (ev.clientY || (ev as unknown as TouchEvent).touches[0].clientY) - rect.top;
    }
  };

  public render(): React.ReactElement<any> | null {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      elementRef,

      axis,

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onDrag,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onDragEnd,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onDragStart,

      ...props
    } = this.props as ScrollbarThumbProps;

    props.className = cnb(
      'ScrollbarsCustom-Thumb',
      axis === AXIS_DIRECTION.X ? 'ScrollbarsCustom-ThumbX' : 'ScrollbarsCustom-ThumbY',
      props.className
    );

    if (props.renderer) {
      (props as ScrollbarThumbProps).axis = axis;
    }

    return (
      <DraggableCore
        allowAnyClick={false}
        enableUserSelectHack={false}
        onMouseDown={this.handleOnMouseDown}
        onDrag={this.handleOnDrag}
        onStart={this.handleOnDragStart}
        onStop={this.handleOnDragStop}
        nodeRef={this.elementRef}>
        {renderDivWithRenderer(props, mergeRefs([this.elementRef, elementRef]))}
      </DraggableCore>
    );
  }
}
