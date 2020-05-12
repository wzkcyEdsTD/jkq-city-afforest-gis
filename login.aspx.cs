using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Text;
namespace Client {
    public partial class Login : System.Web.UI.Page {

        protected void Page_Load(object sender, EventArgs e) {
            if (!IsPostBack) {
                if (Session["scene"] != null || Session["exurl"] != null)
                {
                    var temp1 = Session["scene"];
                    var temp2 = Session["exurl"];
                    Session.Clear();
                    Session["scene"] = temp1;
                    Session["exurl"] = temp2;
                }
                else
                {
                    Session.Clear();
                }
                int indexof = -1;
                if (Request.UrlReferrer != null) {
                    indexof = Request.UrlReferrer.ToString().IndexOf("manage");
                }
                if (Request.QueryString["exurl"] != null || indexof != -1)
                {
                    Session["exurl"] = "manage.aspx";
                }
                LoginSetting.Login(Page);
            }
        }
    }
}