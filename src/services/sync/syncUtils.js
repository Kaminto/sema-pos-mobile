
class SyncUtils {

  compareRemoteAndLocal(otherArray) {
    return function (current) {
        return otherArray.filter(function (other) {
            return ((other.created_at > current.created_at || other.created_at === current.created_at) &&
                (other.updated_at > current.updated_at ||
                    other.updated_at === current.updated_at))
                ;
        }).length == 0;
    }
}

}
export default new SyncUtils();
