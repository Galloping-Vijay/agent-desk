package httpx

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mlogclub/simple/web"
)

func GetPathInt64(ctx *gin.Context, name string) (int64, bool) {
	value, err := strconv.ParseInt(ctx.Param(name), 10, 64)
	if err != nil {
		WriteHttpStatusJSON(ctx, http.StatusBadRequest, web.JsonErrorMsg("路径参数错误"))
		return 0, false
	}
	return value, true
}
