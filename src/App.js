import React from "react";
import "@atlaskit/css-reset";
import styled from "styled-components";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import initialData from "./utils/initial-data";
import Column from "./components/Column";

const Container = styled.div`
  display: flex;
`;

class InnerList extends React.PureComponent {
  // shouldComponentUpdate(nextProps) {
  //   if (
  //     nextProps.column === this.props.column &&
  //     nextProps.taskMap === this.props.taskMap &&
  //     nextProps.index === this.props.index
  //   ) {
  //     return false;
  //   }
  //   return true;
  // }
  render() {
    const { column, taskMap, index } = this.props;
    const tasks = column.taskIds.map(taskId => taskMap[taskId]);
    return <Column column={column} tasks={tasks} index={index} />;
  }
}

class App extends React.Component {
  state = initialData;

  handleOnDragStart = (start, provided) => {
    // document.body.style.color = "orange";
    // document.body.style.transition = "background-color 0.2s ease";

    // const homeIndex = this.state.columnOrder.indexOf(start.source.droppableId);
    // this.setState({ homeIndex });

    provided.announce(
      `You have lifted the task in position ${start.source.index + 1}`
    );
  };

  handleOnDragUpdate = (update, provided) => {
    const { destination } = update;

    // const opacity = destination
    //   ? destination.index / Object.keys(this.state.tasks).length
    //   : 0;

    // document.body.style.backgroundColor = `rgba(153, 141, 217, ${opacity})`;
    const message = destination
      ? `You have moved the task to position ${destination.index + 1}`
      : `You are currently not over a droppable area`;

    provided.announce(message);
  };

  handleOnDragEnd = (result, provided) => {
    // this.setState({ homeIndex: null });
    document.body.style.color = "inherit";
    document.body.style.backgroundColor = "inherit";

    const { destination, source, draggableId, type } = result;
    const message = destination
      ? `You have moved the task from position ${source.index +
          1} to ${destination.index + 1}`
      : `The task has been returned to its starting postion of ${result.source
          .index + 1}`;

    provided.announce(message);

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "column") {
      const newColumnOrder = Array.from(this.state.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      const newState = {
        ...this.state,
        columnOrder: newColumnOrder
      };
      this.setState(newState);
      return;
    }

    const start = this.state.columns[source.droppableId];
    const finish = this.state.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds
      };

      const newState = {
        ...this.state,
        columns: {
          ...this.state.columns,
          [newColumn.id]: newColumn
        }
      };
      this.setState(newState);
      return;
    }

    // Moving from ine list to another
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds
    };

    const newState = {
      ...this.state,
      columns: {
        ...this.state.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      }
    };
    this.setState(newState);
  };

  render() {
    const { columnOrder, columns, tasks } = this.state;
    return (
      <DragDropContext
        onDragEnd={this.handleOnDragEnd}
        onDragStart={this.handleOnDragStart}
        onDragUpdate={this.handleOnDragUpdate}
      >
        <Droppable
          droppableId="all-columns"
          direction="horizontal"
          type="column"
        >
          {provided => (
            <Container {...provided.droppableProps} ref={provided.innerRef}>
              {columnOrder.map((columnId, index) => {
                const column = columns[columnId];
                // const task = column.taskIds.map(taskId => tasks[taskId]);

                // const isDropDisabled = index < this.state.homeIndex;
                return (
                  <InnerList
                    index={index}
                    key={column.id}
                    column={column}
                    taskMap={tasks}
                    // isDropDisabled={isDropDisabled}
                  />
                );
              })}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

export default App;
