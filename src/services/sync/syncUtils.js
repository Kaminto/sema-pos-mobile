
import {
    parseISO,
    isSameDay,
    format,
    sub,
    set,
    add,
    getSeconds,
    getMinutes,
    getHours,
    differenceInMilliseconds,
    compareAsc
  } from "date-fns";
class SyncUtils {

  compareRemoteAndLocal(otherArray) {
    return function (current) {
        return otherArray.filter(function (other) {
            let currentDatediff = differenceInMilliseconds(
                new Date(current.created_at),
                new Date(other.created_at)
              );
      
              let isSameCurrentDay = isSameDay(
                new Date(current.created_at),
                new Date(other.created_at)
              );
      
              let updateDatediff = differenceInMilliseconds(
                new Date(current.updated_at),
                new Date(other.updated_at)
              );
      
              let isSameUpdateDay = isSameDay(
                new Date(current.updated_at),
                new Date(other.updated_at)
              );
      
              return (
                (currentDatediff > 0 || isSameCurrentDay) &&
                (updateDatediff > 0 || isSameUpdateDay)
              );
        }).length == 0;
    }
}

}
export default new SyncUtils();
